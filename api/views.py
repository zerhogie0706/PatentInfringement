import openai
import re
from django.conf import settings

# Set your OpenAI API key
openai.api_key = settings.OPEN_AI_API_KEY
client = openai.OpenAI(organization='org-dGg6pn9D4J3OiMLJYg2xDJfT')

# Define a function to generate the prompt
def generate_prompt(claim, product_description):
    return f"""
    Analyze the relevance between the following patent claim and product description.
    
    **Patent Claim:** {claim}
    
    **Product Description:** {product_description}
    
    Provide a summary explaining any functional similarities. Rate the relevance on a scale of 0-100, where 100 indicates a high level of similarity.
    """


# Define a function to extract confidence score from the response
def extract_confidence_score(response_text):
    match = re.search(r"\b(100|[1-9]?[0-9])\b", response_text)
    if match:
        return int(match.group(0))
    return 0  # Default if no score is found


# Define a function to run the analysis
def analyze_products_and_claims(products, claims, threshold=70):
    results = []
    for product in products:
        relevant_claims = []
        explanations = []
        
        for claim in claims:
            # Generate prompt and get response from LLM
            prompt = generate_prompt(claim, product['description'])
            response = openai.Completion.create(
                engine="gpt-4",
                prompt=prompt,
                max_tokens=200,
                temperature=0.3
            )
            response_text = response['choices'][0]['text']
            confidence_score = extract_confidence_score(response_text)
            
            # Only consider results above the confidence threshold
            if confidence_score > threshold:
                relevant_claims.append(claim)
                explanations.append({
                    "confidence_score": confidence_score,
                    "explanation": response_text.strip()
                })

        # Only add product results if there's at least one relevant claim above threshold
        if relevant_claims:
            results.append({
                "product_name": product['name'],
                "confidence_score": max([exp['confidence_score'] for exp in explanations]),
                "relevant_claims": relevant_claims,
                "summarized_explanation": "; ".join([exp["explanation"] for exp in explanations])
            })

    return results

# Example usage
products = [
    {"name": "Walmart Shopping App", "description": "Mobile app with integrated shopping list and advertisement features"},
    {"name": "Scan & Go", "description": "App allows users to add items to their shopping list while scanning"}
]

claims = [
    "A method for generating a digital shopping list triggered by ad selection",
    "A system that automatically syncs a shopping list based on ad interaction"
]

# Run the analysis and get the structured output
output = analyze_products_and_claims(products, claims, threshold=70)

# Print the result in JSON format
import json
print(json.dumps(output, indent=2))
