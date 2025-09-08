"""
Setup script for Protest Monitor Agent
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def setup_environment():
    """Setup environment file"""
    if not os.path.exists('.env'):
        print("📝 Creating .env file from template...")
        try:
            with open('env_example.txt', 'r') as f:
                content = f.read()
            
            with open('.env', 'w') as f:
                f.write(content)
            
            print("✅ .env file created!")
            print("⚠️  Please edit .env file and add your API credentials")
            return True
        except Exception as e:
            print(f"❌ Error creating .env file: {e}")
            return False
    else:
        print("ℹ️  .env file already exists")
        return True

def main():
    """Main setup function"""
    print("🚀 Setting up Protest Monitor Agent...")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        return
    
    # Setup environment
    if not setup_environment():
        return
    
    print("\n✅ Setup complete!")
    print("\n📋 Next steps:")
    print("1. Edit the .env file and add your API credentials:")
    print("   - Twitter Bearer Token (required)")
    print("   - OpenAI API Key OR Anthropic API Key (required)")
    print("2. Run: python protest_monitor_agent.py")
    print("\n🔗 To get Twitter API credentials:")
    print("   Visit: https://developer.twitter.com/en/portal/dashboard")
    print("\n🔗 To get OpenAI API key:")
    print("   Visit: https://platform.openai.com/api-keys")
    print("\n🔗 To get Anthropic API key:")
    print("   Visit: https://console.anthropic.com/")

if __name__ == "__main__":
    main()
