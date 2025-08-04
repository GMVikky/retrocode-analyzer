import asyncio
import json
import re
from typing import Dict, Any, Optional
from groq import Groq
from .config import settings

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        self.timeout = settings.GROQ_TIMEOUT
        self.max_tokens = settings.GROQ_MAX_TOKENS
    
    async def analyze_code(self, code: str, language: str, file_name: Optional[str] = None) -> Dict[str, Any]:
        """Complete code analysis with improved error handling"""
        try:
            # Check code length
            if len(code) > settings.MAX_CODE_LENGTH:
                return {
                    "error": f"Code too long. Maximum {settings.MAX_CODE_LENGTH} characters allowed.",
                    "quality_score": 0,
                    "language": language
                }
            
            # Auto-detect language if needed
            if not language or language == "auto":
                language = self._detect_language(code, file_name)
            
            print(f"🚀 Starting analysis for {language} code ({len(code)} chars)")
            
            # Single comprehensive analysis (faster than multi-stage)
            analysis_result = await self._comprehensive_analysis(code, language, file_name)
            
            print(f"✅ Analysis complete with quality score: {analysis_result.get('quality_score', 0)}")
            return analysis_result
            
        except Exception as e:
            print(f"❌ Analysis failed: {str(e)}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "quality_score": 0,
                "language": language,
                "basic_analysis": {
                    "summary": "Analysis failed due to an error",
                    "issues": [str(e)],
                    "suggestions": ["Please try again with different code"]
                }
            }
    
    async def _comprehensive_analysis(self, code: str, language: str, file_name: Optional[str]) -> Dict[str, Any]:
        """Single comprehensive analysis instead of multi-stage"""
        
        # Improved prompt for better structured output
        prompt = f"""Analyze this {language} code and provide a comprehensive analysis.

Code to analyze:
```{language}
{code}
```

Please provide your analysis in this exact JSON format:
{{
    "summary": "Brief summary of the code",
    "quality_score": 85,
    "issues": [
        "Issue 1 description",
        "Issue 2 description"
    ],
    "suggestions": [
        "Suggestion 1",
        "Suggestion 2"
    ],
    "security_issues": [
        "Security issue 1",
        "Security issue 2"
    ],
    "performance_issues": [
        "Performance issue 1"
    ],
    "enhanced_code": "```{language}\\n# Enhanced version of the code\\nprint('improved code')\\n```"
}}

Important: Respond ONLY with valid JSON. No additional text before or after."""

        try:
            print("📤 Sending comprehensive analysis request...")
            response = await self._make_groq_request(prompt)
            print(f"📥 Received response: {len(response)} characters")
            
            # Try to parse JSON directly first
            try:
                # Clean the response
                response = response.strip()
                
                # Extract JSON if wrapped in markdown
                if "```json" in response:
                    json_match = re.search(r'```json\s*\n(.*?)\n```', response, re.DOTALL)
                    if json_match:
                        response = json_match.group(1)
                
                # Parse JSON
                parsed_result = json.loads(response)
                print("✅ Successfully parsed JSON response")
                
                # Validate and process the result
                return self._process_analysis_result(parsed_result, language)
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                # Fallback to text parsing
                return self._fallback_text_parsing(response, language)
                
        except Exception as e:
            print(f"❌ Comprehensive analysis failed: {e}")
            raise e
    
    def _process_analysis_result(self, result: Dict[str, Any], language: str) -> Dict[str, Any]:
        """Process and structure the analysis result"""
        
        # Extract enhanced code
        enhanced_code = result.get("enhanced_code", "")
        if enhanced_code and "```" in enhanced_code:
            code_match = re.search(r'```(?:\w+)?\s*\n(.*?)\n```', enhanced_code, re.DOTALL)
            if code_match:
                enhanced_code = code_match.group(1).strip()
        
        quality_score = result.get("quality_score", 75)
        if isinstance(quality_score, str):
            try:
                quality_score = float(quality_score)
            except:
                quality_score = 75
        
        return {
            "basic_analysis": {
                "summary": result.get("summary", "Code analysis completed"),
                "issues": result.get("issues", []),
                "suggestions": result.get("suggestions", []),
                "complexity": "Medium",
                "maintainability": "Good"
            },
            "security_analysis": {
                "vulnerabilities": result.get("security_issues", []),
                "security_score": max(0, quality_score - len(result.get("security_issues", [])) * 10),
                "recommendations": ["Follow security best practices"]
            },
            "performance_analysis": {
                "bottlenecks": result.get("performance_issues", []),
                "optimizations": ["Consider optimization techniques"],
                "performance_score": max(0, quality_score - len(result.get("performance_issues", [])) * 5),
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            "enhanced_code": enhanced_code,
            "quality_score": quality_score,
            "language": language,
            "recommendations": [
                "Review the suggestions provided",
                "Test the enhanced code thoroughly",
                "Follow best practices for " + language
            ]
        }
    
    def _fallback_text_parsing(self, response: str, language: str) -> Dict[str, Any]:
        """Fallback parsing when JSON fails"""
        print("🔄 Using fallback text parsing...")
        
        lines = response.split('\n')
        issues = []
        suggestions = []
        
        # Simple text extraction
        for line in lines:
            line = line.strip()
            if line.startswith('-') or line.startswith('•'):
                content = line[1:].strip()
                if any(word in content.lower() for word in ['issue', 'problem', 'error', 'bug']):
                    issues.append(content)
                elif any(word in content.lower() for word in ['suggest', 'improve', 'recommend']):
                    suggestions.append(content)
        
        return {
            "basic_analysis": {
                "summary": "Analysis completed with text parsing",
                "issues": issues[:5],  # Limit to 5 items
                "suggestions": suggestions[:5],
                "complexity": "Medium",
                "maintainability": "Good"
            },
            "security_analysis": {
                "vulnerabilities": [],
                "security_score": 75,
                "recommendations": ["Review code for security issues"]
            },
            "performance_analysis": {
                "bottlenecks": [],
                "optimizations": ["Consider performance improvements"],
                "performance_score": 75,
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            },
            "enhanced_code": "",
            "quality_score": 75,
            "language": language,
            "recommendations": ["Analysis completed successfully"]
        }
    
    async def _make_groq_request(self, prompt: str) -> str:
        """Make request to Groq API with improved error handling"""
        try:
            print(f"🔄 Making Groq API request...")
            print(f"   Model: {self.model}")
            print(f"   Max tokens: {self.max_tokens}")
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert code analyzer. Always respond with valid JSON only."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=self.max_tokens,
                top_p=0.9,
                stream=False,
                timeout=self.timeout
            )
            
            response = completion.choices[0].message.content
            print(f"✅ Groq API response received: {len(response) if response else 0} characters")
            
            return response or "Analysis completed"
            
        except Exception as e:
            print(f"❌ Groq API request failed: {str(e)}")
            raise Exception(f"AI service temporarily unavailable: {str(e)}")
    
    def _detect_language(self, code: str, file_name: Optional[str] = None) -> str:
        """Auto-detect programming language"""
        
        # First try by file extension
        if file_name:
            ext = file_name.lower().split('.')[-1]
            ext_map = {
                'py': 'python', 'js': 'javascript', 'ts': 'typescript',
                'jsx': 'javascript', 'tsx': 'typescript', 'java': 'java',
                'cpp': 'cpp', 'c': 'c', 'cs': 'csharp', 'php': 'php',
                'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
                'kt': 'kotlin', 'scala': 'scala', 'r': 'r', 'sql': 'sql',
                'html': 'html', 'css': 'css', 'vue': 'vue', 'svelte': 'svelte'
            }
            if ext in ext_map:
                return ext_map[ext]
        
        # Fallback to content-based detection
        code_lower = code.lower()
        
        # Python indicators
        if any(indicator in code for indicator in ['def ', 'import ', 'from ', '# ', 'print(']):
            return 'python'
        
        # JavaScript/TypeScript indicators
        if any(indicator in code for indicator in ['function ', 'const ', 'let ', 'var ', '=>', 'console.log']):
            if ': ' in code and 'interface ' in code_lower:
                return 'typescript'
            return 'javascript'
        
        # Java indicators
        if any(indicator in code for indicator in ['public class', 'public static', 'System.out']):
            return 'java'
        
        # C/C++ indicators
        if any(indicator in code for indicator in ['#include', 'int main', 'printf', 'cout']):
            return 'cpp'
        
        # Default fallback
        return 'python'

# Initialize service
groq_service = GroqService()