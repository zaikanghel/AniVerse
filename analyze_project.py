#!/usr/bin/env python3

"""
AnimeVerse Project Analyzer
This script performs a detailed analysis of the AnimeVerse project structure and components.
"""

import os
import sys
import json
import re
from collections import defaultdict, Counter

class ProjectAnalyzer:
    def __init__(self, project_path="animeverse_project/AnimeVerse"):
        self.project_path = project_path
        self.file_extensions = Counter()
        self.directory_structure = defaultdict(list)
        self.frontend_frameworks = []
        self.backend_frameworks = []
        self.database_tech = []
        self.readme_content = ""
        self.package_json = None
        self.requirements_txt = []
        self.important_files = []
        
    def analyze(self):
        """Main analysis method"""
        print("Starting analysis of AnimeVerse project...")
        
        if not os.path.exists(self.project_path):
            print(f"Error: Project path '{self.project_path}' does not exist.")
            print("Make sure to run import_project.sh first to clone the repository.")
            sys.exit(1)
            
        self._parse_directory_structure()
        self._identify_frameworks()
        self._parse_readme()
        self._find_important_files()
        
        self._generate_report()
        
    def _parse_directory_structure(self):
        """Walk through the directory and collect information about structure and files"""
        print("Analyzing directory structure...")
        
        for root, dirs, files in os.walk(self.project_path):
            # Skip node_modules and other large generated directories
            if 'node_modules' in root or '.git' in root:
                continue
                
            rel_path = os.path.relpath(root, self.project_path)
            if rel_path == '.':
                rel_path = 'root'
                
            for file in files:
                full_path = os.path.join(root, file)
                ext = os.path.splitext(file)[1].lower()
                
                # Count file extensions
                self.file_extensions[ext] += 1
                
                # Add file to directory structure
                self.directory_structure[rel_path].append(file)
                
                # Identify important files for further analysis
                if file.lower() in ['package.json', 'requirements.txt', 'composer.json', 
                                   'dockerfile', 'docker-compose.yml', '.env.example', 
                                   'readme.md', 'app.js', 'main.py', 'index.js', 'server.js']:
                    self.important_files.append(full_path)
        
        print(f"Found {sum(self.file_extensions.values())} files across {len(self.directory_structure)} directories")
        
    def _identify_frameworks(self):
        """Identify frameworks and technologies used in the project"""
        print("Identifying frameworks and technologies...")
        
        # Check for package.json to identify Node.js packages
        package_json_path = os.path.join(self.project_path, 'package.json')
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path, 'r') as f:
                    self.package_json = json.load(f)
                    
                dependencies = {**self.package_json.get('dependencies', {}), 
                               **self.package_json.get('devDependencies', {})}
                
                # Check for frontend frameworks
                if 'react' in dependencies:
                    self.frontend_frameworks.append('React')
                if 'vue' in dependencies:
                    self.frontend_frameworks.append('Vue.js')
                if 'angular' in dependencies or '@angular/core' in dependencies:
                    self.frontend_frameworks.append('Angular')
                if 'next' in dependencies:
                    self.frontend_frameworks.append('Next.js')
                if 'nuxt' in dependencies:
                    self.frontend_frameworks.append('Nuxt.js')
                if 'svelte' in dependencies:
                    self.frontend_frameworks.append('Svelte')
                    
                # Check for backend frameworks
                if 'express' in dependencies:
                    self.backend_frameworks.append('Express.js')
                if 'koa' in dependencies:
                    self.backend_frameworks.append('Koa.js')
                if 'fastify' in dependencies:
                    self.backend_frameworks.append('Fastify')
                if 'nest' in dependencies or '@nestjs/core' in dependencies:
                    self.backend_frameworks.append('NestJS')
                    
                # Check for database technologies
                if 'mongoose' in dependencies or 'mongodb' in dependencies:
                    self.database_tech.append('MongoDB')
                if 'sequelize' in dependencies or 'mysql' in dependencies:
                    self.database_tech.append('SQL (likely MySQL)')
                if 'pg' in dependencies or 'postgres' in dependencies:
                    self.database_tech.append('PostgreSQL')
                if 'sqlite' in dependencies:
                    self.database_tech.append('SQLite')
                if 'redis' in dependencies:
                    self.database_tech.append('Redis')
            except json.JSONDecodeError:
                print("Warning: package.json exists but could not be parsed")
        
        # Check for requirements.txt to identify Python packages
        req_txt_path = os.path.join(self.project_path, 'requirements.txt')
        if os.path.exists(req_txt_path):
            try:
                with open(req_txt_path, 'r') as f:
                    self.requirements_txt = [line.strip() for line in f if line.strip()]
                
                req_lower = [r.lower() for r in self.requirements_txt]
                
                # Check for Python frameworks
                if any('django' in r for r in req_lower):
                    self.backend_frameworks.append('Django')
                if any('flask' in r for r in req_lower):
                    self.backend_frameworks.append('Flask')
                if any('fastapi' in r for r in req_lower):
                    self.backend_frameworks.append('FastAPI')
                
                # Check for Python database technologies
                if any('sqlalchemy' in r for r in req_lower):
                    self.database_tech.append('SQLAlchemy ORM')
                if any('psycopg' in r for r in req_lower):
                    self.database_tech.append('PostgreSQL')
                if any('pymysql' in r or 'mysqlclient' in r for r in req_lower):
                    self.database_tech.append('MySQL')
                if any('pymongo' in r for r in req_lower):
                    self.database_tech.append('MongoDB')
            except Exception as e:
                print(f"Warning: Error parsing requirements.txt: {e}")
        
        # If no frameworks were detected through dependency files, try to detect by file patterns
        if not self.frontend_frameworks:
            # React detection
            if self.file_extensions.get('.jsx', 0) > 0 or self.file_extensions.get('.tsx', 0) > 0:
                self.frontend_frameworks.append('React (detected by JSX/TSX files)')
                
            # Vue detection
            if self.file_extensions.get('.vue', 0) > 0:
                self.frontend_frameworks.append('Vue.js (detected by .vue files)')
        
        if not self.backend_frameworks:
            # Express detection by file contents
            for root, _, files in os.walk(self.project_path):
                for file in files:
                    if file.endswith('.js') or file.endswith('.ts'):
                        try:
                            with open(os.path.join(root, file), 'r') as f:
                                content = f.read()
                                if 'require("express")' in content or "require('express')" in content:
                                    self.backend_frameworks.append('Express.js (detected in code)')
                                    break
                        except:
                            continue
    
    def _parse_readme(self):
        """Parse the README file to extract project information"""
        readme_path = os.path.join(self.project_path, 'README.md')
        if os.path.exists(readme_path):
            try:
                with open(readme_path, 'r') as f:
                    self.readme_content = f.read()
                print("README.md found and parsed")
            except:
                print("Warning: README.md exists but could not be read")
                
    def _find_important_files(self):
        """Identify important configuration and entry point files"""
        # Already collected in _parse_directory_structure
        pass
        
    def _generate_report(self):
        """Generate a comprehensive report about the project"""
        report = ["# AnimeVerse Project Analysis Report\n"]
        
        # Add project overview
        report.append("## Project Overview\n")
        if self.readme_content:
            # Extract first paragraph or section from README
            first_section = self.readme_content.split('\n\n')[0] if '\n\n' in self.readme_content else self.readme_content
            report.append(f"{first_section}\n")
        else:
            report.append("No README.md found or it couldn't be parsed.\n")
        
        # Add technology stack
        report.append("## Technology Stack\n")
        
        if self.frontend_frameworks:
            report.append("### Frontend\n")
            for fw in self.frontend_frameworks:
                report.append(f"- {fw}\n")
        else:
            report.append("### Frontend\n- Not clearly identified\n")
            
        if self.backend_frameworks:
            report.append("\n### Backend\n")
            for fw in self.backend_frameworks:
                report.append(f"- {fw}\n")
        else:
            report.append("\n### Backend\n- Not clearly identified\n")
            
        if self.database_tech:
            report.append("\n### Database\n")
            for db in self.database_tech:
                report.append(f"- {db}\n")
        else:
            report.append("\n### Database\n- Not clearly identified\n")
        
        # Add file statistics
        report.append("\n## File Statistics\n")
        report.append("### File Extensions\n")
        for ext, count in self.file_extensions.most_common(10):
            ext_name = ext if ext else "(no extension)"
            report.append(f"- {ext_name}: {count}\n")
        
        # Add directory structure overview
        report.append("\n## Directory Structure Overview\n")
        report.append("```\n")
        for dir_name, files in sorted(self.directory_structure.items()):
            if dir_name == 'root':
                report.append("/\n")
            else:
                report.append(f"/{dir_name}/\n")
            
            # Show only first 10 files if there are many
            if len(files) > 10:
                for file in sorted(files)[:10]:
                    report.append(f"  - {file}\n")
                report.append(f"  - ... and {len(files) - 10} more files\n")
            else:
                for file in sorted(files):
                    report.append(f"  - {file}\n")
        report.append("```\n")
        
        # Add setup recommendations
        report.append("\n## Setup Recommendations\n")
        
        if self.frontend_frameworks or '.js' in self.file_extensions or '.jsx' in self.file_extensions or '.ts' in self.file_extensions:
            report.append("### Node.js Setup\n")
            report.append("```bash\n# Install Node.js dependencies\nnpm install\n\n# Start the application\nnpm start\n```\n")
        
        if self.requirements_txt or '.py' in self.file_extensions:
            report.append("### Python Setup\n")
            report.append("```bash\n# Create a virtual environment\npython -m venv venv\nsource venv/bin/activate  # On Windows: venv\\Scripts\\activate\n\n# Install dependencies\npip install -r requirements.txt\n\n# Run the application (example command, check actual entry point)\npython app.py\n```\n")
        
        # Write report to file
        with open('project_report.md', 'w') as f:
            f.write(''.join(report))
            
        print("Analysis complete! Check project_report.md for details.")

if __name__ == "__main__":
    analyzer = ProjectAnalyzer()
    analyzer.analyze()
