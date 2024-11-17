from flask import Flask, jsonify, request
from flask_cors import CORS
from joblib import load

try:
    presence_classifier = load('presence_classifer.joblib')
    presence_vect = load('presence_vectorizer.joblib')
    category_classifier = load('category_classifier.joblib')
    category_vect = load('category_vectorizer.joblib')
except Exception as e:
    print(f"Error loading models: {e}")
    exit(1)

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        # Ensure the request has JSON and the required data
        data = request.get_json()
        if not data or 'tokens' not in data:
            return jsonify({'error': 'Bad request, "tokens" key is required'}), 400

        tokens = data['tokens']
        if not isinstance(tokens, list):
            return jsonify({'error': '"tokens" should be a list'}), 400

        output = []
        for token in tokens:
            result = presence_classifier.predict(presence_vect.transform([token]))
            if result == 'Dark':
                cat = category_classifier.predict(category_vect.transform([token]))
                output.append(cat[0])
            else:
                output.append(result[0])

        dark = [tokens[i] for i in range(len(output)) if output[i] == 'Dark']
        for d in dark:
            print(d)
        print()
        print(len(dark))

        message = {'result': output}
        print(message)

        return jsonify(message)

if __name__ == '__main__':
    app.run(threaded=True, debug=True, use_reloader=False)
