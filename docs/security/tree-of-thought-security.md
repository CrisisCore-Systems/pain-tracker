# Tree of Thought Security Reasoning System

## Overview

The Tree of Thought Reasoning system is an advanced security analysis framework that uses hierarchical decision trees to evaluate security vectors and collapse conditions in the CrisisCore Pain Tracker application.

## Architecture

### Core Components

1. **ThoughtNode Class** - Represents nodes in the reasoning tree with:
   - Type classification
   - Severity assessment  
   - Evidence collection
   - Confidence scoring
   - Dependency tracking
   - Reasoning explanations

2. **Security Analysis Branches**:
   - **CODE_EXECUTION_RISKS** - Dynamic code execution and injection vectors
   - **STATE_MANAGEMENT_RISKS** - State mutation and data flow security
   - **ASYNC_CONCURRENCY_RISKS** - Race conditions and async security vectors  
   - **DATA_FLOW_RISKS** - Data exposure and leakage vectors

3. **Enhanced Pattern Detection**:
   - Context-aware code analysis
   - Compound risk assessment
   - Confidence-based filtering
   - Hierarchical reasoning paths

## Key Features

### Hierarchical Analysis
- Builds decision trees for security reasoning
- Evaluates compound risks across multiple vectors
- Provides detailed reasoning explanations
- Tracks dependencies between security issues

### Advanced Detection
- **Random Control Flow**: Detects non-deterministic execution paths
- **Mutable State Exposure**: Identifies unsafe state getter patterns
- **Async Race Conditions**: Finds unhandled async operations
- **Memory Pollution**: Detects global scope contamination
- **Event Cascades**: Identifies potential cascade failure points

### Confidence Scoring
- Uses confidence thresholds to reduce false positives
- Adjusts severity based on context and evidence
- Provides weighted risk assessment

### Tree Reasoning Paths
- Analyzes all paths from root to leaves
- Identifies critical reasoning chains
- Reports high-confidence security vectors only

## Usage

### Command Line
```bash
# Run tree-of-thought analysis only
npm run check-tree-reasoning

# Run enhanced collapse vector detection (legacy + tree reasoning)
npm run check-security
```

### Integration
The system is integrated into:
- Pre-commit hooks via `scripts/pre-commit.js`
- Security scanning pipeline
- CI/CD workflows via hardening scripts

## Output Format

### Tree Structure
```
🌳 Security Reasoning Tree:
[INFO] SECURITY_ANALYSIS_ROOT: Comprehensive security vector analysis
  [HIGH] CODE_EXECUTION_RISKS: Analysis of dynamic code execution
    [CRITICAL] RANDOM_CONTROL_FLOW: Non-deterministic control flow detected
      Evidence: Found 1 instances in file.tsx
      Reasoning: Math.random() creates unpredictable execution paths
      Confidence: 90.0%
```

### Critical Path Analysis
```
Critical Path 1:
  ├─ SECURITY_ANALYSIS_ROOT
  ├─ CODE_EXECUTION_RISKS  
  └─ RANDOM_CONTROL_FLOW
    → Math.random() in control flow creates collapse vectors
```

## Configuration

### Severity Levels
- **CRITICAL**: Immediate security risk requiring action
- **HIGH**: Significant risk that should be addressed
- **MEDIUM**: Moderate risk for review
- **LOW**: Minor issue for awareness
- **INFO**: Informational finding

### Confidence Thresholds
- Critical paths require ≥80% confidence
- Individual issues tracked at all confidence levels
- False positives filtered based on evidence quality

## Benefits

1. **Reduced False Positives**: Confidence-based filtering
2. **Contextual Analysis**: Understanding of code relationships
3. **Hierarchical Insights**: Clear reasoning chains
4. **Actionable Reports**: Specific evidence and explanations
5. **Compound Risk Detection**: Multi-vector security analysis

## Integration with Existing Systems

### Legacy Pattern Detection
- Maintains backward compatibility
- Combines results with tree reasoning
- Provides hybrid analysis approach

### Pre-commit Hooks
- Integrated as critical security check
- Fails builds on high-confidence critical paths
- Provides detailed feedback for developers

### Hardening Scripts
- Used in `harden_repo.sh` and `remediate_repo.sh`
- Validates security improvements
- Ensures system health post-remediation

## Future Enhancements

1. **Machine Learning Integration**: Pattern learning from codebase
2. **Custom Rule Definition**: Domain-specific security vectors  
3. **Risk Scoring Models**: Advanced threat assessment
4. **Automated Remediation**: Suggested fixes for detected issues
5. **Integration APIs**: External security tool connectivity

## Best Practices

1. **Regular Scanning**: Run tree reasoning in CI/CD pipeline
2. **Review Critical Paths**: Investigate all high-confidence findings
3. **Update Patterns**: Maintain detection rules as codebase evolves
4. **Document Exceptions**: Track approved security exceptions
5. **Monitor Trends**: Track security vector evolution over time