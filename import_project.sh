#!/bin/bash

# AnimeVerse Project Import Script
# This script clones the AnimeVerse repository and performs initial analysis

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting AnimeVerse Project Import...${NC}"

# Create a directory for the project if it doesn't exist
mkdir -p animeverse_project
cd animeverse_project

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Clone the repository
echo -e "${YELLOW}Cloning the AnimeVerse repository...${NC}"
git clone https://github.com/zaikanghel/AnimeVerse.git

# Check if clone was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to clone repository. Please check the URL and your internet connection.${NC}"
    exit 1
fi

cd AnimeVerse

# Identify package managers and configuration files
echo -e "${YELLOW}Analyzing project configuration...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}Found Node.js project (package.json)${NC}"
    # Display key dependencies
    echo "Node.js Dependencies:"
    grep -A 20 '"dependencies"' package.json | grep -v "dependencies" | grep ":"
fi

if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}Found Python project (requirements.txt)${NC}"
    echo "Python Dependencies:"
    cat requirements.txt
fi

if [ -f "composer.json" ]; then
    echo -e "${GREEN}Found PHP project (composer.json)${NC}"
fi

if [ -f "pom.xml" ]; then
    echo -e "${GREEN}Found Java Maven project (pom.xml)${NC}"
fi

if [ -f "build.gradle" ]; then
    echo -e "${GREEN}Found Java Gradle project (build.gradle)${NC}"
fi

if [ -f "Gemfile" ]; then
    echo -e "${GREEN}Found Ruby project (Gemfile)${NC}"
fi

# Look for Docker configurations
if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}Found Docker configuration${NC}"
fi

# Count files by extension to help identify technologies
echo -e "${YELLOW}Analyzing file types...${NC}"
echo "File extension counts:"
find . -type f | grep -v "node_modules" | grep -v ".git" | sed 's/.*\.//' | sort | uniq -c | sort -nr

echo -e "${GREEN}Repository successfully cloned and initial analysis complete.${NC}"
echo "For detailed analysis, run the analyze_project.py script next."
echo "For setup instructions, refer to setup_guide.md"

cd ../..
