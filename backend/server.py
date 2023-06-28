from flask import Flask, request, jsonify
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
import pinecone
import torch
from panns_inference import AudioTagging
import librosa
import pandas as pd
from tensorflow import keras
from tensorflow.keras.models import Model
import tensorflow.keras.backend as K
from tqdm import tqdm
from collections import Counter
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

PINECONE_API_KEY_1 = os.environ.get("PINECONE_API_KEY_1")
PINECONE_ENVIRONMENT_1 = os.environ.get("PINECONE_ENVIRONMENT_1")

PINECONE_API_KEY_2 = os.environ.get("PINECONE_API_KEY_2")
PINECONE_ENVIRONMENT_2 = os.environ.get("PINECONE_ENVIRONMENT_2")

PINECONE_API_KEY_3 = os.environ.get("PINECONE_API_KEY_3")
PINECONE_ENVIRONMENT_3 = os.environ.get("PINECONE_ENVIRONMENT_3")

app = Flask(__name__)
database={'Manish':'123','Yash':'aac','kartik':'asdsf','Shubham' : '123' ,'narendramodi' : '123456'}

@app.route('/', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    global id
    id = username
    # Validate username and password
    # Perform authentication logic

    # Return appropriate response
    if username in database and database[username] == password:
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 201

@app.route('/face', methods=['POST'])
def face_similarity():
    img_file = request.files['image'] # Replace 'path/to/save/image.jpg' with your desired save path
    img = Image.open(img_file)
    mtcnn = MTCNN()
    face = mtcnn(img)
    if face is None:
        return jsonify({'message': 'No face detected'}), 201
    resnet = InceptionResnetV1(pretrained="vggface2").eval()
    # generate embedding for the face extracted using mtcnn above
    embedding = resnet(torch.stack([face]))
    pinecone.init(
        api_key=PINECONE_API_KEY_1,
        environment=PINECONE_ENVIRONMENT_1
    )
    index_name = "tmdb-people"
    index = pinecone.GRPCIndex(index_name)
    embedding = embedding.tolist()
    result = index.query(embedding[0], top_k=1)
    first_match = result['matches'][0]
    name = first_match['id']
    score = first_match['score']
    if score>0.5 and name==id:
        return jsonify({'message' : 'Face verified successfully'}), 200
    return jsonify({'message': 'Invalid user'}), 201

@app.route('/audio', methods=['POST'])
def audio_similarity():
    audio = request.files['audio']
    # Save the audio file or process it as needed
    audio.save("recording.wav")
    audio, sample_rate = librosa.core.load("recording.wav",  sr=44100, mono=True)
    audio = audio[None, :]
    model = AudioTagging(checkpoint_path=None, device='cuda')  
    pinecone.init(
        api_key=PINECONE_API_KEY_2,
        environment=PINECONE_ENVIRONMENT_2  # find next to API key
    )
    index_name = "audio-search-demo"
    index = pinecone.Index(index_name)
    _, xq = model.inference(audio) 
    results = index.query(xq.tolist(), top_k=1)
    first_match = results['matches'][0]
    name = first_match['id']
    score = first_match['score']
    if score>0.5 and name==id:
        return jsonify({'message' : 'Audio verified successfully'}), 200
    # Return a response indicating success
    return jsonify({'message': 'Invalid user'}), 201

@app.route('/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    password = request.json.get('password')
    global signup_id
    signup_id = username
    
    if len(username)==0 or len(password)==0:
        return jsonify({'message': 'Please enter username and password'}), 201
    if username in database:
        return jsonify({'message': 'Username already exist'}), 201
    else:
        database[username] = password
        return jsonify({'message': 'SignUp successful'}), 200

@app.route('/face_signup', methods=['POST'])
def face_signup():
    img_file = request.files['image']
    img = Image.open(img_file)
    mtcnn = MTCNN()
    face = mtcnn(img)
    if face is None:
        return jsonify({'message': 'No face detected'}), 201
    resnet = InceptionResnetV1(pretrained="vggface2").eval()
    # generate embedding for the face extracted using mtcnn above
    embedding = resnet(torch.stack([face]))
    pinecone.init(
        api_key=PINECONE_API_KEY_1,
        environment=PINECONE_ENVIRONMENT_1
    )
    index_name = "tmdb-people"
    index = pinecone.GRPCIndex(index_name)
    embedding = embedding.tolist()
    name=[]
    name.append(signup_id)
    to_upsert = list(zip(name, embedding))
    _ = index.upsert(vectors=to_upsert)
    return jsonify({'message': 'Image uploaded successfully'}), 200

@app.route('/audio_signup', methods=['POST'])
def audio_signup():
    audio = request.files['audio']
    # Save the audio file or process it as needed
    audio.save("recording.wav")
    audio, sample_rate = librosa.core.load("recording.wav",  sr=44100, mono=True)
    audio = audio[None, :]
    model = AudioTagging(checkpoint_path=None, device='cuda')  
    pinecone.init(
        api_key=PINECONE_API_KEY_2,
        environment=PINECONE_ENVIRONMENT_2  # find next to API key
    )
    index_name = "audio-search-demo"
    index = pinecone.Index(index_name)
    _, emb = model.inference(audio)
    name=[]
    name.append(signup_id)
    to_upsert = list(zip(name, emb.tolist()))
    _ = index.upsert(vectors=to_upsert)
    return jsonify({'message': 'Audio uploaded successfully'}), 200

@app.route('/threat_detection', methods=['POST'])
def handle_file_upload():
    file = request.files['file']
    # Process the uploaded file as needed
    # Example: Save the file to disk
    file.save("uploaded_file.csv")
    pinecone.init(
        api_key=PINECONE_API_KEY_3,
        environment=PINECONE_ENVIRONMENT_3
    )
    # Pick a name for the new service
    index_name = 'it-threats'
    index = pinecone.Index(index_name=index_name)
    my_model = keras.models.load_model("model")
    layer_name = 'dense' 
    intermediate_layer_model = Model(inputs=my_model.input,
                                    outputs=my_model.get_layer(layer_name).output)
    test = pd.read_csv("uploaded_file.csv")
    test_data1=test.drop(['proto','service','state'],axis=1)
    data_sample1 = test_data1.iloc[0:1,:]
    data_sample=data_sample1.drop(['attack_cat'],axis=1)
    y_true = []
    y_pred = []

    BATCH_SIZE = 1

    for i in tqdm(range(0, len(data_sample), BATCH_SIZE)):
        test_data = data_sample.iloc[i:i+BATCH_SIZE, :]
        data_sample2=data_sample1.iloc[i:i+BATCH_SIZE, :]
        # Create vector embedding using the model
        test_vector = intermediate_layer_model.predict(K.constant(test_data.iloc[:, :-1]))
        # Query using the vector embedding
        query_results = []

        for xq in test_vector.tolist():
            query_res = index.query(xq, top_k=20)
            query_results.append(query_res)
        
        ids = [res.id for result in query_results for res in result.matches]
        
        for label, res in zip(data_sample2.attack_cat.values, query_results):
            # Add to the true list
            if label == 'Normal':
                y_true.append(0)
            else:
                y_true.append(1)
            
            counter = Counter(match.id.split('_')[0] for match in res.matches)

            # Add to the predicted list
            if counter['Nor']:
                y_pred.append(0)
            else:
                y_pred.append(1)
    print(y_pred)
    if y_pred[0]==1:
        return 'Potential network threat detected'
    return 'No threat detected'

if __name__ == '__main__':
    app.run()
