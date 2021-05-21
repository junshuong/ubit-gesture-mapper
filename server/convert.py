import os
import random
from platform import system
import tensorflow as tf
import numpy as np
from database import get_all_gestures, get_classifier_count

def import_data(model_id):
    x_data, y_data = get_all_gestures(model_id)
    x_data = [sample_to_tensor(x) for x in x_data]
    y_data = [sample_to_tensor(y) for y in y_data]
    # Model 1 represents bad training data.
    xb_data, yb_data = get_all_gestures(1)
    xb_data = [sample_to_tensor(x) for x in xb_data]
    yb_data = [sample_to_tensor([0]) for y in yb_data]

    x_data = tf.concat([x_data, xb_data], 0)
    y_data = tf.concat([y_data, yb_data], 0)
    return x_data, y_data

def random_training_sample(data):
    return data[random.randint(0, len(data)-1)]


def sample_to_tensor(sample):
    a = np.array(sample)
    flattened = a.flatten()
    te = np.expand_dims(flattened, 0)
    te = tf.convert_to_tensor(te)
    return te


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
    classifier_count = get_classifier_count(model_id)+1  # Number of unique possible outputs
    print("Creating model")
    print(f"classifier length {classifier_count}")
    # Creating the classifier
    model = create_model(input_shape, classifier_count)
    # Importing the data from the database
    input_tensors, target_tensors = import_data(model_id)
    print(f"Length inputs: {len(input_tensors[0])}")
    # Shaping x and y (because tensorflow)
    train_x = tf.concat(input_tensors, 0)
    train_y = tf.concat(target_tensors, 0)

    model.fit(train_x, train_y, epochs=400)  # Fitting the data
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
