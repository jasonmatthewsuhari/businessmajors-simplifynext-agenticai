"""
Protest Monitor Agent using Amazon Strands SDK
Monitors Reddit and news sources for protest-related activity in specific cities
"""

import os
import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import praw
import requests
from newsapi import NewsApiClient
from dotenv import load_dotenv
from geopy.geocoders import Nominatim
from textblob import TextBlob
import pandas as pd
from bs4 import BeautifulSoup

from strands_agents_sdk import Agent, tool, provider
from strands_agents_sdk.providers import OpenAIProvider, AnthropicProvider

# Load environment variables
load_dotenv()

@dataclass
class ProtestEvent:
    """Data structure for protest events"""
    id: str
    title: str
    text: str
    author: str
    created_at: datetime
    location: str
    city: str
    source: str  # 'reddit' or 'news'
    sentiment: float
    score: int  # upvotes for reddit, engagement for news
    comments_count: int
    url: str
    subreddit: Optional[str] = None
    news_source: Optional[str] = None

class RedditAPI:
    """Reddit API wrapper for protest monitoring"""
    
    def __init__(self):
        self.client_id = os.getenv('REDDIT_CLIENT_ID')
        self.client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        self.user_agent = os.getenv('REDDIT_USER_AGENT', 'protest_monitor_v1.0')
        
        if self.client_id and self.client_secret:
            self.reddit = praw.Reddit(
                client_id=self.client_id,
                client_secret=self.client_secret,
                user_agent=self.user_agent
            )
        else:
            self.reddit = None
            print("⚠️  Reddit credentials not found. Reddit search will be limited.")
    
    def search_protests(self, city: str, limit: int = 100) -> List[Dict]:
        """Search for protest-related posts on Reddit"""
        if not self.reddit:
            return []
        
        protest_keywords = [
            "protest", "demonstration", "rally", "march", "strike",
            "activism", "demonstrators", "protesters", "civil disobedience",
            "police", "arrest", "riot", "crowd", "gathering", "blm", "justice"
        ]
        
        # Search in relevant subreddits
        subreddits = [
            "news", "worldnews", "politics", "PublicFreakout", "protest",
            "activism", "Bad_Cop_No_Donut", "2020PoliceBrutality",
            city.lower().replace(" ", ""), f"{city.lower()}news"
        ]
        
        posts = []
        
        try:
            for subreddit_name in subreddits:
                try:
                    subreddit = self.reddit.subreddit(subreddit_name)
                    
                    # Search for city + protest keywords
                    for keyword in protest_keywords[:5]:  # Limit to avoid rate limits
                        query = f"{city} {keyword}"
                        
                        # Search hot posts
                        for submission in subreddit.search(query, sort='hot', time_filter='month', limit=10):
                            if city.lower() in submission.title.lower() or city.lower() in submission.selftext.lower():
                                posts.append({
                                    'id': submission.id,
                                    'title': submission.title,
                                    'text': submission.selftext,
                                    'author': str(submission.author) if submission.author else 'unknown',
                                    'created_at': datetime.fromtimestamp(submission.created_utc),
                                    'score': submission.score,
                                    'comments_count': submission.num_comments,
                                    'url': f"https://reddit.com{submission.permalink}",
                                    'subreddit': subreddit_name
                                })
                                
                                if len(posts) >= limit:
                                    return posts
                                    
                except Exception as e:
                    print(f"Error searching subreddit {subreddit_name}: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error searching Reddit: {e}")
            
        return posts

class NewsAPI:
    """News API wrapper for protest monitoring"""
    
    def __init__(self):
        self.api_key = os.getenv('NEWS_API_KEY')
        if self.api_key:
            self.client = NewsApiClient(api_key=self.api_key)
        else:
            self.client = None
            print("⚠️  News API key not found. Will use alternative news sources.")
        
        self.geolocator = Nominatim(user_agent="protest_monitor")
    
    def search_protests(self, city: str, limit: int = 100) -> List[Dict]:
        """Search for protest-related news articles"""
        articles = []
        
        # Try NewsAPI first
        if self.client:
            articles.extend(self._search_newsapi(city, limit // 2))
        
        # Fallback to web scraping
        articles.extend(self._search_web_news(city, limit // 2))
        
        return articles[:limit]
    
    def _search_newsapi(self, city: str, limit: int) -> List[Dict]:
        """Search using NewsAPI"""
        if not self.client:
            return []
            
        protest_keywords = ["protest", "demonstration", "rally", "march", "strike", "activism"]
        articles = []
        
        try:
            for keyword in protest_keywords[:3]:  # Limit API calls
                query = f"{city} {keyword}"
                
                response = self.client.get_everything(
                    q=query,
                    language='en',
                    sort_by='publishedAt',
                    from_param=(datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    page_size=min(20, limit)
                )
                
                for article in response['articles']:
                    if city.lower() in article['title'].lower() or city.lower() in (article['description'] or '').lower():
                        articles.append({
                            'id': article['url'],
                            'title': article['title'],
                            'text': article['description'] or '',
                            'author': article['author'] or 'unknown',
                            'created_at': datetime.fromisoformat(article['publishedAt'].replace('Z', '+00:00')),
                            'score': 0,  # News doesn't have scores
                            'comments_count': 0,
                            'url': article['url'],
                            'news_source': article['source']['name']
                        })
                        
                        if len(articles) >= limit:
                            return articles
                            
        except Exception as e:
            print(f"Error with NewsAPI: {e}")
            
        return articles
    
    def _search_web_news(self, city: str, limit: int) -> List[Dict]:
        """Fallback web scraping for news"""
        articles = []
        
        # Google News search (simplified)
        try:
            protest_terms = ["protest", "demonstration", "rally"]
            
            for term in protest_terms[:2]:
                query = f"{city} {term} news"
                search_url = f"https://www.google.com/search?q={query}&tbm=nws"
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                try:
                    response = requests.get(search_url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Simple extraction (this is a basic implementation)
                        news_items = soup.find_all('div', class_='BNeawe')[:5]
                        
                        for item in news_items:
                            text = item.get_text()
                            if city.lower() in text.lower() and any(p in text.lower() for p in protest_terms):
                                articles.append({
                                    'id': f"web_{len(articles)}",
                                    'title': text[:100],
                                    'text': text,
                                    'author': 'web_search',
                                    'created_at': datetime.now(),
                                    'score': 0,
                                    'comments_count': 0,
                                    'url': search_url,
                                    'news_source': 'web_search'
                                })
                                
                                if len(articles) >= limit:
                                    return articles
                                    
                except Exception as e:
                    print(f"Error scraping web news: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error in web news search: {e}")
            
        return articles

# Initialize APIs
reddit_api = RedditAPI()
news_api = NewsAPI()

@tool
def search_protest_posts(city: str, max_results: int = 100) -> str:
    """
    Search Reddit and news sources for protest-related content in a specific city.
    
    Args:
        city: The city name to search for protests (e.g., "New York", "Los Angeles")
        max_results: Maximum number of posts to retrieve (default: 100)
    
    Returns:
        JSON string containing formatted protest event data
    """
    try:
        all_events = []
        
        # Search Reddit (50% of results)
        reddit_limit = max_results // 2
        print(f"🔍 Searching Reddit for protests in {city}...")
        reddit_posts = reddit_api.search_protests(city, reddit_limit)
        
        for post in reddit_posts:
            # Extract sentiment
            text_content = f"{post['title']} {post['text']}"
            blob = TextBlob(text_content)
            sentiment = blob.sentiment.polarity
            
            event = {
                "id": f"reddit_{post['id']}",
                "title": post['title'],
                "text": post['text'][:500] + "..." if len(post['text']) > 500 else post['text'],
                "author": post['author'],
                "created_at": post['created_at'].isoformat(),
                "city": city,
                "source": "reddit",
                "sentiment": round(sentiment, 3),
                "score": post['score'],
                "comments_count": post['comments_count'],
                "url": post['url'],
                "subreddit": post['subreddit']
            }
            all_events.append(event)
        
        # Search News (50% of results)
        news_limit = max_results // 2
        print(f"📰 Searching news sources for protests in {city}...")
        news_articles = news_api.search_protests(city, news_limit)
        
        for article in news_articles:
            # Extract sentiment
            text_content = f"{article['title']} {article['text']}"
            blob = TextBlob(text_content)
            sentiment = blob.sentiment.polarity
            
            event = {
                "id": f"news_{len(all_events)}",
                "title": article['title'],
                "text": article['text'][:500] + "..." if len(article['text']) > 500 else article['text'],
                "author": article['author'],
                "created_at": article['created_at'].isoformat(),
                "city": city,
                "source": "news",
                "sentiment": round(sentiment, 3),
                "score": 0,  # News doesn't have scores like Reddit
                "comments_count": article['comments_count'],
                "url": article['url'],
                "news_source": article.get('news_source', 'unknown')
            }
            all_events.append(event)
        
        if not all_events:
            return json.dumps({
                "status": "no_results",
                "message": f"No protest-related content found for {city}",
                "city": city,
                "events": []
            })
        
        # Sort by creation date (most recent first)
        all_events.sort(key=lambda x: x['created_at'], reverse=True)
        
        result = {
            "status": "success",
            "city": city,
            "total_events": len(all_events),
            "reddit_events": len([e for e in all_events if e['source'] == 'reddit']),
            "news_events": len([e for e in all_events if e['source'] == 'news']),
            "search_timestamp": datetime.now().isoformat(),
            "events": all_events[:max_results]
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Error searching for protests in {city}: {str(e)}",
            "city": city,
            "events": []
        })

@tool
def analyze_protest_sentiment(events_data: str) -> str:
    """
    Analyze the sentiment and key themes from protest event data.
    
    Args:
        events_data: JSON string containing protest events data
    
    Returns:
        Analysis summary with sentiment breakdown and key insights
    """
    try:
        data = json.loads(events_data)
        events = data.get('events', [])
        
        if not events:
            return "No events to analyze."
        
        # Sentiment analysis
        sentiments = [event['sentiment'] for event in events]
        avg_sentiment = sum(sentiments) / len(sentiments)
        
        positive_count = len([s for s in sentiments if s > 0.1])
        negative_count = len([s for s in sentiments if s < -0.1])
        neutral_count = len(sentiments) - positive_count - negative_count
        
        # Source breakdown
        reddit_events = [e for e in events if e['source'] == 'reddit']
        news_events = [e for e in events if e['source'] == 'news']
        
        # Engagement metrics (Reddit upvotes, news engagement)
        total_reddit_score = sum(event.get('score', 0) for event in reddit_events)
        total_comments = sum(event.get('comments_count', 0) for event in events)
        
        # Extract common themes from titles
        all_titles = [event.get('title', '') for event in events]
        common_words = []
        for title in all_titles:
            words = re.findall(r'\b\w+\b', title.lower())
            common_words.extend([w for w in words if len(w) > 4 and w not in ['protest', 'demonstr', 'march']])
        
        word_freq = pd.Series(common_words).value_counts().head(10) if common_words else pd.Series()
        
        # News sources breakdown
        news_sources = [event.get('news_source', 'unknown') for event in news_events]
        source_freq = pd.Series(news_sources).value_counts().head(5) if news_sources else pd.Series()
        
        # Subreddit breakdown
        subreddits = [event.get('subreddit', 'unknown') for event in reddit_events]
        subreddit_freq = pd.Series(subreddits).value_counts().head(5) if subreddits else pd.Series()
        
        analysis = {
            "summary": {
                "total_events": len(events),
                "reddit_events": len(reddit_events),
                "news_events": len(news_events),
                "sentiment_breakdown": {
                    "positive": positive_count,
                    "negative": negative_count,
                    "neutral": neutral_count,
                    "average_sentiment": round(avg_sentiment, 3)
                },
                "engagement": {
                    "total_reddit_upvotes": total_reddit_score,
                    "total_comments": total_comments,
                    "avg_reddit_score": round(total_reddit_score / len(reddit_events), 1) if reddit_events else 0,
                    "avg_comments_per_post": round(total_comments / len(events), 1) if events else 0
                }
            },
            "top_themes": word_freq.to_dict() if not word_freq.empty else {},
            "top_news_sources": source_freq.to_dict() if not source_freq.empty else {},
            "top_subreddits": subreddit_freq.to_dict() if not subreddit_freq.empty else {},
            "insights": []
        }
        
        # Generate insights
        if avg_sentiment < -0.3:
            analysis["insights"].append("High negative sentiment detected - potential for escalation")
        elif avg_sentiment > 0.3:
            analysis["insights"].append("Positive sentiment suggests peaceful demonstrations")
        
        if total_reddit_score > len(reddit_events) * 50:
            analysis["insights"].append("High Reddit engagement - content resonating with community")
        
        if len(news_events) > len(reddit_events):
            analysis["insights"].append("More news coverage than social discussion - major event")
        elif len(reddit_events) > len(news_events) * 2:
            analysis["insights"].append("High social media discussion - grassroots movement")
        
        if total_comments > len(events) * 20:
            analysis["insights"].append("High discussion volume - controversial or engaging topic")
        
        return json.dumps(analysis, indent=2)
        
    except Exception as e:
        return f"Error analyzing sentiment: {str(e)}"

@tool
def filter_by_keywords(events_data: str, keywords: str) -> str:
    """
    Filter protest events by specific keywords or themes.
    
    Args:
        events_data: JSON string containing protest events data
        keywords: Comma-separated keywords to filter by (e.g., "police,arrest,violence")
    
    Returns:
        Filtered events data matching the keywords
    """
    try:
        data = json.loads(events_data)
        events = data.get('events', [])
        
        keyword_list = [k.strip().lower() for k in keywords.split(',')]
        
        filtered_events = []
        for event in events:
            text_lower = event['text'].lower()
            if any(keyword in text_lower for keyword in keyword_list):
                filtered_events.append(event)
        
        result = {
            **data,
            "filtered_by": keyword_list,
            "original_count": len(events),
            "filtered_count": len(filtered_events),
            "events": filtered_events
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return f"Error filtering events: {str(e)}"

@tool
def get_recent_protests_summary(city: str) -> str:
    """
    Get a comprehensive summary of recent protest activity in a city.
    
    Args:
        city: The city name to analyze
    
    Returns:
        Comprehensive summary including events, sentiment, and key insights
    """
    # First search for posts
    events_data = search_protest_posts(city, 100)
    
    # Then analyze the data
    analysis = analyze_protest_sentiment(events_data)
    
    try:
        events = json.loads(events_data)
        analysis_data = json.loads(analysis)
        
        summary = f"""
PROTEST ACTIVITY SUMMARY FOR {city.upper()}
{'=' * 50}

📊 OVERVIEW:
- Total Events Found: {events.get('total_events', 0)}
- Reddit Posts: {events.get('reddit_events', 0)}
- News Articles: {events.get('news_events', 0)}
- Search Timestamp: {events.get('search_timestamp', 'Unknown')}
- Status: {events.get('status', 'Unknown')}

😊 SENTIMENT ANALYSIS:
- Positive Posts: {analysis_data['summary']['sentiment_breakdown']['positive']}
- Negative Posts: {analysis_data['summary']['sentiment_breakdown']['negative']}
- Neutral Posts: {analysis_data['summary']['sentiment_breakdown']['neutral']}
- Average Sentiment: {analysis_data['summary']['sentiment_breakdown']['average_sentiment']}

📈 ENGAGEMENT METRICS:
- Total Reddit Upvotes: {analysis_data['summary']['engagement']['total_reddit_upvotes']:,}
- Total Comments: {analysis_data['summary']['engagement']['total_comments']:,}
- Avg Reddit Score: {analysis_data['summary']['engagement']['avg_reddit_score']}
- Avg Comments per Post: {analysis_data['summary']['engagement']['avg_comments_per_post']}

🏷️ TOP THEMES:
"""
        
        for theme, count in list(analysis_data['top_themes'].items())[:5]:
            summary += f"- {theme}: {count} mentions\n"
        
        summary += "\n📰 TOP NEWS SOURCES:\n"
        for source, count in list(analysis_data['top_news_sources'].items())[:3]:
            summary += f"- {source}: {count} articles\n"
        
        summary += "\n🔗 TOP SUBREDDITS:\n"
        for subreddit, count in list(analysis_data['top_subreddits'].items())[:3]:
            summary += f"- r/{subreddit}: {count} posts\n"
        
        summary += "\n🔍 KEY INSIGHTS:\n"
        for insight in analysis_data['insights']:
            summary += f"- {insight}\n"
        
        if events.get('events'):
            summary += f"\n📱 RECENT POSTS (showing first 3):\n"
            for i, event in enumerate(events['events'][:3], 1):
                source_icon = "🔗" if event['source'] == 'reddit' else "📰"
                source_text = f"r/{event.get('subreddit', 'unknown')}" if event['source'] == 'reddit' else event.get('news_source', 'unknown')
                
                summary += f"\n{i}. {source_icon} {event.get('author', 'unknown')} | {source_text} ({event.get('created_at', 'unknown time')}):\n"
                summary += f"   📰 \"{event.get('title', 'No title')}\"\n"
                if event.get('text'):
                    summary += f"   📝 \"{event['text'][:150]}{'...' if len(event['text']) > 150 else ''}\"\n"
                
                if event['source'] == 'reddit':
                    summary += f"   ⬆️ {event.get('score', 0)} upvotes | 💬 {event.get('comments_count', 0)} comments\n"
                else:
                    summary += f"   💬 {event.get('comments_count', 0)} comments\n"
                
                summary += f"   🌐 {event.get('url', '')}\n"
        
        return summary
        
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def create_protest_monitor_agent():
    """Create and configure the protest monitoring agent"""
    
    # Configure LLM provider (choose based on your preference/API keys)
    if os.getenv('OPENAI_API_KEY'):
        llm_provider = OpenAIProvider(model="gpt-4")
    elif os.getenv('ANTHROPIC_API_KEY'):
        llm_provider = AnthropicProvider(model="claude-3-sonnet-20240229")
    else:
        raise ValueError("No LLM provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY")
    
    # Define the agent's prompt
    agent_prompt = """
You are a Protest Monitor Agent specialized in gathering and analyzing real-time information about protest activities in specific cities using Reddit and news sources.

Your primary responsibilities:
1. Search for protest-related content on Reddit and news platforms
2. Analyze sentiment and engagement patterns
3. Identify key themes, trending topics, and news coverage
4. Provide comprehensive summaries of protest activity
5. Filter and categorize events by relevance and severity

When a user asks about protests in a city, you should:
1. Search for recent protest-related posts from Reddit and news sources
2. Analyze the sentiment and engagement metrics (upvotes, comments, news coverage)
3. Identify key themes, subreddits, and news sources
4. Provide a comprehensive summary with insights

Data Sources:
- Reddit: Community discussions, firsthand accounts, grassroots movements
- News: Professional reporting, verified information, broader context

Always be objective and factual in your analysis. Focus on providing actionable intelligence while respecting privacy and avoiding speculation. Clearly distinguish between social media discussion and professional news reporting.

Available tools:
- search_protest_posts: Search Reddit and news sources for protest-related content
- analyze_protest_sentiment: Analyze sentiment and themes from protest data
- filter_by_keywords: Filter events by specific keywords
- get_recent_protests_summary: Get comprehensive summary of protest activity

Use these tools strategically to provide thorough and insightful analysis combining both grassroots social media perspective and professional news coverage.
"""
    
    # Create the agent with tools
    agent = Agent(
        prompt=agent_prompt,
        tools=[
            search_protest_posts,
            analyze_protest_sentiment,
            filter_by_keywords,
            get_recent_protests_summary
        ],
        provider=llm_provider
    )
    
    return agent

if __name__ == "__main__":
    # Example usage
    try:
        agent = create_protest_monitor_agent()
        
        print("🤖 Protest Monitor Agent initialized!")
        print("Available commands:")
        print("- Ask about protests in any city")
        print("- Request sentiment analysis")
        print("- Filter by specific keywords")
        print("\nExample: 'What protest activity is happening in New York?'")
        
        while True:
            user_input = input("\n💬 Enter your query (or 'quit' to exit): ")
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            print("\n🔍 Analyzing...")
            response = agent.run(user_input)
            print(f"\n🤖 Agent Response:\n{response}")
            
    except Exception as e:
        print(f"❌ Error initializing agent: {e}")
        print("\nPlease ensure you have:")
        print("1. Set up your Reddit API credentials (recommended) and/or News API key (optional)")
        print("2. Set up your LLM provider API key (OpenAI or Anthropic)")
        print("3. Installed all required dependencies: pip install -r requirements.txt")
        print("\n📋 API Setup Instructions:")
        print("🔗 Reddit API: https://www.reddit.com/prefs/apps")
        print("🔗 News API: https://newsapi.org/")
        print("🔗 OpenAI: https://platform.openai.com/api-keys")
        print("🔗 Anthropic: https://console.anthropic.com/")
