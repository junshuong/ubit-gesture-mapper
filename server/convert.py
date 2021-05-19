import tensorflow as tf
from database import get_all_gestures, setup_database
import random
import numpy as np
import os
from platform import system


def import_data(model_id):
    raw_data = get_all_gestures(model_id)
    records = {}
    for gesture in raw_data:
        id = gesture[0]
        target = gesture[1]
        ax = gesture[2]
        ay = gesture[3]
        az = gesture[4]
        mx = gesture[5]
        my = gesture[6]
        mz = gesture[7]
        if id not in records:
            records[id] = {}
        records[id]["target"] = target
        if "data" not in records[id]:
            records[id]["data"] = []
        records[id]["data"].append([ax, ay, az, mx, my, mz])
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


def create_model(input_shape, classifier_count):
    model = tf.keras.Sequential([
        tf.keras.layers.Flatten(input_shape=input_shape),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(classifier_count)
    ])

    model.compile(optimizer='adam',
                  loss=tf.keras.losses.SparseCategoricalCrossentropy(
                      from_logits=True),
                  metrics=['accuracy'])

    return model


def train_new_model(model_id):
    # 1 Gesture, 180 data points (30 x, y, z accelerometer values and 30 x, y, z magnetometer values)
    input_shape = (1, 180)
    classifier_count = 2  # Number of unique possible outputs

    # Creating the classifier
    model = create_model(input_shape, classifier_count)
    # Importing the data from the database
    training_data = import_data(model_id)
    input_tensors, target_tensors = all_training_samples(
        training_data)  # Splitting data into x and y
    print(f"Length inputs: {len(input_tensors[0])}")
    # Shaping x and y (because tensorflow)
    train_x = tf.concat(input_tensors, 0)
    train_y = tf.concat(target_tensors, 0)

    model.fit(train_x, train_y, epochs=20)  # Fitting the data
    model.save_weights(f"./checkpoints/model-{model_id}")
    # Saving the raw model
    tf.saved_model.save(model, f"./learners/model-{model_id}")
    # Creating and saving the model for use in the web
    convert_to_tfjs(model_id)


def convert_to_tfjs(model_id):
    conversion_string = f'''tensorflowjs_converter \
                            --input_format=tf_saved_model \
                            --output_node_names='gesture-{model_id}/shape' \
                            --saved_model_tags=serve \
                            ./learners/model-{model_id} \
                            ./learners/model-{model_id}/web_model'''

    if system() == 'Windows':
        os.system(f'cmd /c {conversion_string}')
    else:
        os.system(conversion_string)
