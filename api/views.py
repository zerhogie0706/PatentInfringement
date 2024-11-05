import ast
import datetime
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import analyze_products_and_claims, find_products_by_name, patent_data


@csrf_exempt
def check_patent_infringement(request):
    data = json.loads(request.body)
    patent_id = data.get('patent_id')
    company_name = data.get('company')
    if not patent_id or not company_name:
        return JsonResponse({'msg': 'Missing data'}, status=400)
    patent = [p for p in patent_data if p['publication_number'] == patent_id]
    if patent:
        patent = patent[0]
    company, company_products = find_products_by_name(company_name)
    if not patent or not company_products:
        return JsonResponse({'msg': 'No data found'}, status=400)

    patent_claims = [data['text'] for data in ast.literal_eval(patent['claims'])]
    patent_claims = patent_claims[:10]
    output = analyze_products_and_claims(company_products, patent_claims)
    return JsonResponse({
        'data': output,
        'analysis_date': datetime.datetime.now().strftime("%Y-%m-%d"),
        'company': company,
        'patent_id': patent_id,
    })
