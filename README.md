# Protest Monitor Agent

An AI agent built with Amazon Strands SDK that monitors Reddit and news sources for protest-related activity in specific cities. The agent provides real-time analysis, sentiment tracking, and comprehensive reporting on protest events.

## 🚀 Features

- **Real-time Multi-Source Monitoring**: Searches Reddit and news sources for protest-related content
- **City-Specific Analysis**: Focuses on specific cities or locations
- **Sentiment Analysis**: Analyzes the emotional tone of protest-related posts
- **Engagement Tracking**: Monitors upvotes, comments, and news coverage
- **Keyword Filtering**: Filters events by specific themes or keywords
- **Comprehensive Reporting**: Generates detailed summaries with actionable insights
- **Multi-LLM Support**: Works with OpenAI, Anthropic, or AWS Bedrock models

## 🛠️ Setup

### 1. Quick Setup
```bash
python setup.py
```

### 2. Manual Setup

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
1. Copy `env_example.txt` to `.env`
2. Add your API credentials:

```env
# Reddit API (Recommended)
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# News API (Optional)
NEWS_API_KEY=your_news_api_key_here

# Choose one LLM provider:
# Option 1: OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Option 2: Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Option 3: AWS Bedrock
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
```

### 3. Get API Credentials

#### Reddit API
1. Visit [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create a new script application
3. Get Client ID and Client Secret
4. Add to `.env` file

#### News API
1. Visit [NewsAPI](https://newsapi.org/)
2. Register for free API key
3. Add to `.env` file

#### LLM Provider (Choose One)

**OpenAI:**
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new API key
3. Add to `.env` file

**Anthropic:**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Add to `.env` file

## 🎯 Usage

### Interactive Mode
```bash
python protest_monitor_agent.py
```

### Example Queries
```
"What protest activity is happening in New York?"
"Analyze recent demonstrations in Los Angeles"
"Show me protest sentiment in Chicago"
"Filter protests in Boston by keyword: police"
```

### Programmatic Usage
```python
from protest_monitor_agent import create_protest_monitor_agent

# Initialize agent
agent = create_protest_monitor_agent()

# Query for protest activity
response = agent.run("What protests are happening in Seattle?")
print(response)
```

## 🔧 Available Tools

### `search_protest_posts(city, max_results)`
Searches Reddit and news sources for protest-related content in a specific city.

**Parameters:**
- `city`: City name (e.g., "New York", "Los Angeles")
- `max_results`: Maximum posts to retrieve (default: 100)

### `analyze_protest_sentiment(events_data)`
Analyzes sentiment and themes from protest event data.

**Returns:**
- Sentiment breakdown (positive/negative/neutral)
- Engagement metrics
- Top hashtags
- Key insights

### `filter_by_keywords(events_data, keywords)`
Filters protest events by specific keywords or themes.

**Parameters:**
- `events_data`: JSON string with protest events
- `keywords`: Comma-separated keywords (e.g., "police,arrest,violence")

### `get_recent_protests_summary(city)`
Generates comprehensive summary of recent protest activity.

**Returns:**
- Complete analysis with events, sentiment, and insights
- Recent posts preview
- Engagement statistics

## 📊 Sample Output

```
PROTEST ACTIVITY SUMMARY FOR NEW YORK
==================================================

📊 OVERVIEW:
- Total Events Found: 45
- Search Timestamp: 2024-01-15T10:30:00
- Status: success

😊 SENTIMENT ANALYSIS:
- Positive Posts: 12
- Negative Posts: 28
- Neutral Posts: 5
- Average Sentiment: -0.234

📈 ENGAGEMENT METRICS:
- Total Likes: 15,420
- Total Reddit Upvotes: 8,750
- Total Comments: 1,250
- Avg Reddit Score: 194.4

🏷️ TOP HASHTAGS:
- #protest: 15 mentions
- #justice: 12 mentions
- #NYC: 8 mentions

🔍 KEY INSIGHTS:
- High negative sentiment detected - potential for escalation
- High viral potential - content spreading rapidly

📱 RECENT POSTS (showing first 3):
1. @activist_nyc (2024-01-15T09:45:00):
   "Peaceful demonstration in Washington Square Park demanding justice..."
   ⬆️ 450 upvotes | 💬 89 comments
```

## 🎛️ Customization

### Adding New Keywords
Edit the `protest_keywords` list in `protest_monitor_agent.py`:
```python
protest_keywords = [
    "protest", "demonstration", "rally", "march", "strike",
    "your_custom_keyword_here"
]
```

### Adjusting Search Filters
Modify the search query in the `search_protests` method:
```python
# Search across multiple subreddits and news sources
subreddits = ["news", "worldnews", "politics", "protest"]
```

### Custom Analysis
Add new tools by using the `@tool` decorator:
```python
@tool
def your_custom_analysis(data: str) -> str:
    """Your custom analysis logic"""
    # Implementation here
    return result
```

## 🔐 Security & Privacy

- **API Keys**: Store securely in `.env` file, never commit to version control
- **Rate Limits**: Respects Reddit and News API rate limits
- **Data Privacy**: No personal data is stored permanently
- **Content Filtering**: Focuses on public protest-related content only

## 🚨 Important Notes

- **Rate Limits**: Reddit and News APIs have reasonable limits
- **Content Policy**: Respects platform terms of service
- **Accuracy**: Combines social media discussion with verified news reporting
- **Legal**: Use responsibly and in compliance with local laws
- **Ethics**: Focus on public safety and peaceful demonstration monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**"Reddit credentials not found"**
- Set `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` in `.env` file
- Agent will still work with limited functionality using web scraping

**"No LLM provider configured"**
- Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env`
- Ensure API key is valid

**"No protest-related content found"**
- Try different city names or spellings
- Check if there's recent protest activity in that location
- Agent searches both Reddit and news sources automatically

### Support

For issues and questions:
1. Check this README
2. Review error messages carefully
3. Verify API credentials are correct
4. Test with a known active protest location

## 🔮 Future Enhancements

- [ ] Support for additional social media platforms
- [ ] Real-time streaming capabilities
- [ ] Geographic heat mapping
- [ ] Historical trend analysis
- [ ] Multi-language support
- [ ] Integration with news APIs
- [ ] Alert system for high-activity events