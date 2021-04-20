import tensorflow as tf
from database import get_all_gestures, setup_database
import random
import numpy as np
import os
from platform import system

setup_database()

# Importing data
def import_data(model_id):
    raw_data = get_all_gestures(model_id)
    records = {}
    for gesture in raw_data:
        id = gesture[0]
        target = gesture[1]
        x = gesture[2]
        y = gesture[3]
        z = gesture[4]
        if id not in records:
            records[id] = {}
        records[id]["target"] = target
        if "data" not in records[id]:
            records[id]["data"] = []
        records[id]["data"].append([x, y, z])
    return list(records.values())

def random_training_sample(data):
    return data[random.randint(0, len(data)-1)]

def sample_to_tensor(sample):
    a = np.array(sample["data"])
    flattened = a.flatten()
    input_tensor = np.expand_dims(flattened, 0)
    input_tensor = tf.convert_to_tensor(input_tensor)
    target_tensor = 1 if sample["target"] else 0
    target_tensor = np.expand_dims(target_tensor, 0)
    target_tensor = tf.convert_to_tensor(target_tensor)
    return input_tensor, target_tensor

def all_training_samples(data):
    input_tensors = []
    target_tensors = []
    for sample in data:
        input_tensor, target_tensor = sample_to_tensor(sample)
        input_tensors.append(input_tensor)
        target_tensors.append(target_tensor)
    return input_tensors, target_tensors

model_id = 3

training_data = import_data(model_id)

tensor = sample_to_tensor(random_training_sample(training_data))

input_shape = (1, 120)
classifier_count = 2

def create_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Flatten(input_shape=input_shape),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(classifier_count)
    ])

    model.compile(optimizer='adam',
                loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                metrics=['accuracy'])
        
    return model

model = create_model()

input_tensors, target_tensors = all_training_samples(training_data)

train_x = tf.concat(input_tensors, 0)
train_y = tf.concat(target_tensors, 0)

model.fit(train_x, train_y, epochs=14)

model.save_weights(f"./checkpoints/model-{model_id}")
tf.saved_model.save(model, f"./learners/model-{model_id}")


conversion_string = f'''tensorflowjs_converter \
                        --input_format=tf_saved_model \
                        --output_node_names='MobilenetV1/Predictions/Reshape_1' \
                        --saved_model_tags=serve \
                        ./learners/model-{model_id} \
                        ./learners/model-{model_id}/web_model'''

if system() == 'Windows':
    os.system(f'cmd /k {conversion_string}')
else:
    os.system(conversion_string)
