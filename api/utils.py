import json
import openai
import re
from django.conf import settings

# Set your OpenAI API key
openai.api_key = settings.OPEN_AI_API_KEY
openai.organization='org-dGg6pn9D4J3OiMLJYg2xDJfT'

CONFIDENCE_THRESHOLD = 70
patent_data_path = 'patents.json'
company_product_data_path = 'company_products.json'

with open(patent_data_path, 'r') as file:
    patent_data = json.load(file)


with open(company_product_data_path, 'r') as file:
    company_product_data = json.load(file)


def find_products_by_name(search_term):
    # Iterate over each company in the data
    for company in company_product_data.get("companies", []):
        # Perform a case-insensitive search
        if search_term.lower() in company.get("name", "").lower():
            return company.get('name'), company.get("products", [])
    # Return None if no match is found
    return None, None


# Define a function to generate the prompt for multiple products and claims
def generate_multi_product_prompt(products, claims):
    product_text = "\n".join([f"{i+1}. {product['name']}: {product['description']}" for i, product in enumerate(products)])
    claims_text = "\n".join([f"{i+1}. {claim}" for i, claim in enumerate(claims)])
    return f"""
    Analyze the relevance of each product against the group of patent claims provided.

    **Products:**
    {product_text}

    **Patent Claims:**
    {claims_text}

    For each product, identify the relevant claim numbers, provide an overall relevance confidence level on a scale of 0-100, and give a summary explaining the relevance.
    """


# Define a function to parse the structured response
def parse_multi_product_response(response_text):
    # Regular expression to capture each product's information in structured format
    product_pattern = (
        r"\*\*Product\s*\d+:\s*(.+?)\*\*\n"         # Capture the product name
        r"Relevant Claim Numbers:\s*([\d, ]+)\n"     # Capture relevant claim numbers
        r"Relevance Confidence Level:\s*(\d+)\n"     # Capture the confidence level
        r"Summary:\s*(.+?)(?=\n\*\*Product|\Z)"      # Capture the summary until the next product or end
    )
    
    results = []
    matches = re.finditer(product_pattern, response_text, re.IGNORECASE | re.DOTALL)
    
    for match in matches:
        product_name = match.group(1).strip()
        claims = [int(num.strip()) for num in match.group(2).split(',')]
        confidence_level = int(match.group(3))
        summary = match.group(4).strip()

        if confidence_level >= CONFIDENCE_THRESHOLD:
            results.append({
                "product": product_name,
                "claims": claims,
                "confidence_level": confidence_level,
                "summary": summary
            })

    return results


# Main function to analyze multiple products with a group of claims
def analyze_products_and_claims(products, claims):
    # Generate a prompt for all products and claims
    prompt = generate_multi_product_prompt(products, claims)

    # Make a single API call to analyze all products and claims
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an assistant analyzing patent claim relevance for multiple products."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000,
        temperature=0.1,
    )

    # Extract the response content
    response_text = response['choices'][0]['message']['content']

    # Parse the response for each product's claims and confidence level
    return parse_multi_product_response(response_text)
