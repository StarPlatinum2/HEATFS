import json
import subprocess
import os
import time

class AIReviewer:
    def __init__(self):
        self.model = "deepseek-coder:6.7b"
        self._check_ollama()
    
    def _check_ollama(self):
        """Check if Ollama is installed and running"""
        try:
            result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=30)
            print(f"Ollama check - return code: {result.returncode}")
            print(f"Ollama check - stdout: {result.stdout}")
            print(f"Ollama check - stderr: {result.stderr}")
            
            if result.returncode != 0:
                print("Warning: Ollama is not responding properly")
                return False
            return True
        except Exception as e:
            print(f"Ollama check failed: {e}")
            return False
    
    def review_code(self, code):
        print(f"Starting code review for code length: {len(code)}")
        
        # If code is too short, return early
        if len(code.strip()) < 10:
            return {
                "summary": "Code is too short for meaningful review",
                "issues": [],
                "rating": 0,
                "error": "Code must be at least 10 characters long"
            }
        
        prompt = f"""
        Please review this Python code and provide feedback in JSON format with this exact structure:
        {{
            "summary": "brief overall summary",
            "rating": 7,
            "issues": [
                {{
                    "type": "bug|security|performance|style",
                    "severity": "low|medium|high", 
                    "description": "issue description",
                    "suggestion": "how to fix it"
                }}
            ]
        }}
        
        Code to review:
        ```python
        {code}
        ```
        
        Please respond with valid JSON only.
        """
        
        try:
            print(f"Sending request to Ollama with model: {self.model}")
            start_time = time.time()
            
            result = subprocess.run([
                'ollama', 'run', self.model, prompt
            ], capture_output=True, text=True, timeout=120)
            
            end_time = time.time()
            print(f"Ollama response time: {end_time - start_time:.2f} seconds")
            print(f"Ollama return code: {result.returncode}")
            print(f"Ollama stdout length: {len(result.stdout)}")
            print(f"Ollama stderr: {result.stderr}")
            
            if result.returncode != 0:
                error_response = {
                    "summary": "Error running AI model",
                    "issues": [],
                    "rating": 0,
                    "error": result.stderr
                }
                print(f"Error response: {error_response}")
                return error_response
            
            response_text = result.stdout
            print(f"Raw AI response: {response_text[:500]}...")  # First 500 chars
            
            # Try to extract JSON from response
            try:
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = response_text[start_idx:end_idx]
                    print(f"Extracted JSON: {json_str}")
                    parsed_response = json.loads(json_str)
                    print(f"Parsed response: {parsed_response}")
                    return parsed_response
                else:
                    print("No JSON found in response, using fallback")
                    return self._create_fallback_response(response_text)
                    
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}")
                return self._create_fallback_response(response_text)
                
        except subprocess.TimeoutExpired:
            print("Ollama request timed out")
            return {
                "summary": "AI review timed out",
                "issues": [],
                "rating": 0,
                "error": "Review took too long to complete"
            }
        except Exception as e:
            print(f"Unexpected error: {e}")
            return {
                "summary": f"Error during AI review: {str(e)}",
                "issues": [],
                "rating": 0,
                "error": str(e)
            }
    
    def _create_fallback_response(self, response_text):
        """Create a structured response when JSON parsing fails"""
        fallback = {
            "summary": "AI review completed (manual review recommended)",
            "issues": [
                {
                    "type": "info",
                    "severity": "low", 
                    "description": "Review completed but response format was unexpected",
                    "suggestion": "Check the raw AI response for details"
                }
            ],
            "rating": 5,
            "raw_response": response_text[:1000]
        }
        print(f"Fallback response: {fallback}")
        return fallback
