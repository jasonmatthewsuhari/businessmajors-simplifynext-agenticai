"""
Test script for Protest Monitor Agent
Tests the agent functionality with sample queries
"""

import json
import os
from dotenv import load_dotenv
from protest_monitor_agent import create_protest_monitor_agent

# Load environment variables
load_dotenv()

def test_api_credentials():
    """Test if required API credentials are available"""
    print("🔑 Testing API credentials...")
    
    # Check Reddit API (optional but recommended)
    reddit_id = os.getenv('REDDIT_CLIENT_ID')
    reddit_secret = os.getenv('REDDIT_CLIENT_SECRET')
    if reddit_id and reddit_secret:
        print("✅ Reddit API credentials found")
    else:
        print("⚠️  Reddit API credentials missing (will use limited functionality)")
    
    # Check News API (optional)
    news_key = os.getenv('NEWS_API_KEY')
    if news_key:
        print("✅ News API key found")
    else:
        print("⚠️  News API key missing (will use web scraping fallback)")
    
    # Check LLM Provider
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    if openai_key:
        print("✅ OpenAI API Key found")
    elif anthropic_key:
        print("✅ Anthropic API Key found")
    else:
        print("❌ No LLM provider API key found")
        return False
    
    return True

def test_agent_initialization():
    """Test agent initialization"""
    print("\n🤖 Testing agent initialization...")
    
    try:
        agent = create_protest_monitor_agent()
        print("✅ Agent initialized successfully")
        return agent
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        return None

def test_tools_individually():
    """Test individual tools with mock data"""
    print("\n🛠️  Testing individual tools...")
    
    try:
        from protest_monitor_agent import search_protest_posts, analyze_protest_sentiment, filter_by_keywords
        
        # Test with a major city (likely to have some results)
        print("Testing search_protest_posts...")
        result = search_protest_posts("New York", 10)
        data = json.loads(result)
        
        if data['status'] == 'success' and len(data['events']) > 0:
            print(f"✅ Found {len(data['events'])} events")
            
            # Test sentiment analysis
            print("Testing analyze_protest_sentiment...")
            sentiment_result = analyze_protest_sentiment(result)
            print("✅ Sentiment analysis completed")
            
            # Test keyword filtering
            print("Testing filter_by_keywords...")
            filtered_result = filter_by_keywords(result, "protest,demonstration")
            print("✅ Keyword filtering completed")
            
        elif data['status'] == 'no_results':
            print("ℹ️  No events found (this is normal if no protests are happening)")
        else:
            print(f"⚠️  Unexpected result: {data}")
            
    except Exception as e:
        print(f"❌ Tool testing failed: {e}")

def test_agent_queries():
    """Test the agent with sample queries"""
    print("\n💬 Testing agent with sample queries...")
    
    agent = test_agent_initialization()
    if not agent:
        return
    
    test_queries = [
        "What protests are happening in New York?",
        "Give me a summary of protest activity in Los Angeles",
    ]
    
    for query in test_queries:
        print(f"\n📝 Testing query: '{query}'")
        try:
            response = agent.run(query)
            print(f"✅ Response received (length: {len(response)} characters)")
            
            # Show first 200 characters of response
            preview = response[:200] + "..." if len(response) > 200 else response
            print(f"📄 Preview: {preview}")
            
        except Exception as e:
            print(f"❌ Query failed: {e}")

def main():
    """Main test function"""
    print("🧪 PROTEST MONITOR AGENT - TEST SUITE")
    print("=" * 50)
    
    # Test 1: API Credentials
    if not test_api_credentials():
        print("\n❌ Tests failed: Missing API credentials")
        print("Please check your .env file and ensure all required credentials are set")
        return
    
    # Test 2: Agent Initialization
    agent = test_agent_initialization()
    if not agent:
        print("\n❌ Tests failed: Agent initialization error")
        return
    
    # Test 3: Individual Tools
    test_tools_individually()
    
    # Test 4: Full Agent Queries
    test_agent_queries()
    
    print("\n🎉 Test suite completed!")
    print("\nIf all tests passed, your agent is ready to use!")
    print("Run 'python protest_monitor_agent.py' to start the interactive mode")

if __name__ == "__main__":
    main()
