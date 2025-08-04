# /backend/app/prompts.py

# System prompt that defines the AI's behavior and expertise
SYSTEM_PROMPT = """
You are an expert software engineer and code analyst with deep knowledge across multiple programming languages, frameworks, and best practices. You specialize in:

- Code quality assessment and improvement
- Security vulnerability detection
- Performance optimization
- Architecture and design patterns
- Best practices and industry standards
- Educational guidance and learning recommendations

Your analysis should be:
- Technically accurate and detailed
- Practical and actionable
- Educational and explanatory
- Professional yet accessible
- Focused on real-world improvements

Always provide specific, concrete suggestions rather than generic advice.
When suggesting improvements, explain the reasoning behind each recommendation.
Consider both novice and experienced developers in your explanations.
"""

# Basic code analysis prompt
CODE_ANALYSIS_PROMPT = """
Analyze the following {language} code from {file_name}:

```{language}
{code}
```

Provide a comprehensive analysis including:

1. **Code Overview**: Brief summary of what the code does
2. **Quality Assessment**: Overall code quality and maintainability
3. **Issues Found**: Specific problems, bugs, or code smells
4. **Suggestions**: Concrete improvements and best practices
5. **Complexity**: Code complexity assessment
6. **Architecture**: Design patterns and architectural considerations

Format your response with clear sections and bullet points for issues and suggestions.
Be specific about line numbers or code sections when identifying problems.
Explain WHY each issue matters and HOW to fix it.
"""

# Security-focused analysis prompt
SECURITY_ANALYSIS_PROMPT = """
Perform a security analysis of this {language} code:

```{language}
{code}
```

Focus on identifying:

1. **Security Vulnerabilities**: 
   - SQL injection risks
   - XSS vulnerabilities
   - Authentication/authorization issues
   - Input validation problems
   - Cryptographic weaknesses
   - Dependency vulnerabilities

2. **Security Best Practices**:
   - Missing security headers
   - Insecure data handling
   - Inadequate error handling
   - Logging security issues

3. **Risk Assessment**:
   - Severity levels (Critical, High, Medium, Low)
   - Potential impact
   - Exploitation likelihood

4. **Remediation**:
   - Specific fixes for each vulnerability
   - Preventive measures
   - Security tools recommendations

Provide a security score (0-100) based on findings.
"""

# Performance analysis prompt
PERFORMANCE_ANALYSIS_PROMPT = """
Analyze the performance characteristics of this {language} code:

```{language}
{code}
```

Evaluate:

1. **Performance Bottlenecks**:
   - Inefficient algorithms
   - Poor data structure choices
   - Unnecessary computations
   - Memory leaks or excessive memory usage
   - I/O inefficiencies

2. **Time Complexity**: Big O analysis where applicable

3. **Space Complexity**: Memory usage analysis

4. **Optimization Opportunities**:
   - Algorithm improvements
   - Caching strategies
   - Database query optimization
   - Resource management

5. **Scalability Considerations**:
   - How the code performs under load
   - Concurrency issues
   - Resource scaling

6. **Performance Best Practices**:
   - Language-specific optimizations
   - Framework-specific improvements
   - Infrastructure considerations

Provide a performance score (0-100) and specific optimization recommendations.
"""

# Code enhancement prompt
CODE_ENHANCEMENT_PROMPT = """
Based on the analysis, create an improved version of this {language} code:

Original Code:
```{language}
{code}
```

Issues to Address:
{issues}

Suggestions to Implement:
{suggestions}

Create an enhanced version that:

1. **Fixes all identified issues**
2. **Implements suggested improvements**
3. **Follows best practices**
4. **Maintains original functionality**
5. **Adds proper documentation**
6. **Improves readability and maintainability**

Provide ONLY the enhanced code with clear comments explaining:
- What was changed and why
- Key improvements made
- Important design decisions

The enhanced code should be production-ready and follow industry standards.
"""

# Language-specific analysis prompts
LANGUAGE_SPECIFIC_PROMPTS = {
    "python": """
    Additional Python-specific analysis:
    - PEP 8 compliance
    - Pythonic code patterns
    - Type hints usage
    - Exception handling
    - Import organization
    - Virtual environment considerations
    - Package structure
    """,
    
    "javascript": """
    Additional JavaScript-specific analysis:
    - ES6+ features usage
    - Async/await vs Promises
    - Event loop considerations
    - Memory management
    - Bundle size optimization
    - Browser compatibility
    - Node.js best practices
    """,
    
    "typescript": """
    Additional TypeScript-specific analysis:
    - Type safety and strict mode
    - Interface vs type usage
    - Generic type usage
    - Compilation target optimization
    - TSConfig best practices
    - Type assertion patterns
    - Decorator usage
    """,
    
    "java": """
    Additional Java-specific analysis:
    - Object-oriented design principles
    - Exception hierarchy usage
    - Collections framework optimization
    - Memory management and GC
    - Concurrency patterns
    - Spring framework considerations
    - Maven/Gradle best practices
    """,
    
    "cpp": """
    Additional C++ specific analysis:
    - Memory management (RAII)
    - Smart pointer usage
    - STL container optimization
    - Template best practices
    - Exception safety guarantees
    - Modern C++ features (C++11/14/17/20)
    - Performance optimization techniques
    """,
    
    "go": """
    Additional Go-specific analysis:
    - Goroutine and channel usage
    - Error handling patterns
    - Interface design
    - Package organization
    - Testing best practices
    - Performance profiling
    - Memory allocation patterns
    """,
    
    "rust": """
    Additional Rust-specific analysis:
    - Ownership and borrowing
    - Lifetime management
    - Error handling with Result/Option
    - Pattern matching optimization
    - Cargo and crate organization
    - Unsafe code blocks
    - Performance characteristics
    """,
    
    "php": """
    Additional PHP-specific analysis:
    - PSR standards compliance
    - Composer dependency management
    - Security best practices
    - Framework-specific patterns
    - Database interaction security
    - Session management
    - Error handling and logging
    """,
    
    "csharp": """
    Additional C#-specific analysis:
    - .NET framework optimization
    - LINQ usage patterns
    - Async/await best practices
    - Garbage collection considerations
    - Exception handling hierarchy
    - Dependency injection patterns
    - Entity Framework optimization
    """,
    
    "ruby": """
    Additional Ruby-specific analysis:
    - Ruby idioms and conventions
    - Gem dependency management
    - Rails best practices
    - Metaprogramming usage
    - Testing patterns (RSpec)
    - Performance optimization
    - Security considerations
    """,
    
    "swift": """
    Additional Swift-specific analysis:
    - Optional handling patterns
    - Protocol-oriented programming
    - Memory management (ARC)
    - Error handling with throws
    - SwiftUI best practices
    - Performance optimization
    - iOS-specific considerations
    """,
    
    "kotlin": """
    Additional Kotlin-specific analysis:
    - Null safety patterns
    - Coroutines usage
    - Extension functions
    - Data classes optimization
    - Android-specific practices
    - Interoperability with Java
    - Functional programming features
    """,
    
    "scala": """
    Additional Scala-specific analysis:
    - Functional programming patterns
    - Immutability best practices
    - Case class usage
    - Pattern matching optimization
    - Type system utilization
    - Akka framework considerations
    - SBT build optimization
    """
}

# Educational prompts for learning recommendations
LEARNING_RECOMMENDATION_PROMPT = """
Based on the code analysis, provide personalized learning recommendations:

Code Quality Level: {quality_score}/100
Main Issues: {main_issues}
Language: {language}

Generate recommendations for:

1. **Immediate Learning Priorities**:
   - Most critical concepts to learn
   - Specific topics to address found issues

2. **Skill Development Path**:
   - Beginner to advanced progression
   - Language-specific learning path
   - Framework and tool recommendations

3. **Learning Resources**:
   - Books, courses, tutorials
   - Practice projects
   - Community resources

4. **Hands-on Practice**:
   - Coding challenges
   - Project ideas
   - Code review practice

5. **Best Practice Areas**:
   - Design patterns to learn
   - Testing methodologies
   - Development workflows

Make recommendations specific to the developer's current skill level based on the code quality.
"""

# Code review simulation prompt
CODE_REVIEW_PROMPT = """
Simulate a professional code review for this code:

```{language}
{code}
```

Provide feedback as a senior developer would in a code review:

1. **Approval Status**: Approve, Request Changes, or Comment
2. **Major Comments**: Significant issues that must be addressed
3. **Minor Comments**: Style, optimization, and improvement suggestions
4. **Positive Feedback**: What the developer did well
5. **Mentoring Notes**: Educational guidance for growth

Use a constructive, mentoring tone that helps the developer learn and improve.
Be specific about what to change and why it matters.
Include line-specific comments where relevant.
"""

# Architecture analysis prompt
ARCHITECTURE_ANALYSIS_PROMPT = """
Analyze the architectural aspects of this {language} code:

```{language}
{code}
```

Evaluate:

1. **Design Patterns**: Identify used patterns and suggest improvements
2. **SOLID Principles**: Adherence to Single Responsibility, Open/Closed, etc.
3. **Coupling and Cohesion**: Module dependencies and organization
4. **Scalability**: How well the design scales
5. **Maintainability**: Ease of future modifications
6. **Testability**: How easy it is to unit test
7. **Extensibility**: Ability to add new features

Provide architectural recommendations and refactoring suggestions.
Consider the broader system context and enterprise patterns.
"""

def get_enhanced_prompt(base_prompt: str, language: str) -> str:
    """
    Enhance base prompt with language-specific considerations
    """
    language_lower = language.lower()
    if language_lower in LANGUAGE_SPECIFIC_PROMPTS:
        return f"{base_prompt}\n\n{LANGUAGE_SPECIFIC_PROMPTS[language_lower]}"
    return base_prompt

def get_analysis_prompt(language: str, code: str, file_name: str = "code snippet") -> str:
    """
    Get comprehensive analysis prompt with language-specific enhancements
    """
    base_prompt = CODE_ANALYSIS_PROMPT.format(
        language=language,
        code=code,
        file_name=file_name
    )
    return get_enhanced_prompt(base_prompt, language)

def get_security_prompt(language: str, code: str) -> str:
    """
    Get security analysis prompt with language-specific considerations
    """
    base_prompt = SECURITY_ANALYSIS_PROMPT.format(language=language, code=code)
    return get_enhanced_prompt(base_prompt, language)

def get_performance_prompt(language: str, code: str) -> str:
    """
    Get performance analysis prompt with language-specific considerations
    """
    base_prompt = PERFORMANCE_ANALYSIS_PROMPT.format(language=language, code=code)
    return get_enhanced_prompt(base_prompt, language)

def get_enhancement_prompt(language: str, code: str, issues: list, suggestions: list) -> str:
    """
    Get code enhancement prompt
    """
    return CODE_ENHANCEMENT_PROMPT.format(
        language=language,
        code=code,
        issues="\n".join([f"- {issue}" for issue in issues]),
        suggestions="\n".join([f"- {suggestion}" for suggestion in suggestions])
    )

def get_learning_prompt(language: str, quality_score: float, main_issues: list) -> str:
    """
    Get learning recommendation prompt
    """
    return LEARNING_RECOMMENDATION_PROMPT.format(
        language=language,
        quality_score=quality_score,
        main_issues=", ".join(main_issues)
    )

def get_code_review_prompt(language: str, code: str) -> str:
    """
    Get code review simulation prompt
    """
    return CODE_REVIEW_PROMPT.format(language=language, code=code)

def get_architecture_prompt(language: str, code: str) -> str:
    """
    Get architecture analysis prompt
    """
    return ARCHITECTURE_ANALYSIS_PROMPT.format(language=language, code=code)