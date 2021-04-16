import tensorflow as tf
from database import get_all_gestures
import random
import numpy as np

# Importing data
def import_data():
    raw_data = get_all_gestures()
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

training_data = import_data()

def random_training_sample():
    return training_data[random.randint(0, len(training_data)-1)]

def sample_to_tensor(sample):
    a = np.array(sample["data"])
    flattened = a.flatten()
    input_tensor = np.expand_dims(flattened, 0)
    input_tensor = tf.convert_to_tensor(input_tensor)
    target_tensor = 1 if sample["target"] else 0
    target_tensor = np.expand_dims(target_tensor, 0)
    target_tensor = tf.convert_to_tensor(target_tensor)
    return input_tensor, target_tensor

def all_training_samples():
    input_tensors = []
    target_tensors = []
    for sample in training_data:
        input_tensor, target_tensor = sample_to_tensor(sample)
        input_tensors.append(input_tensor)
        target_tensors.append(target_tensor)
    return input_tensors, target_tensors
    
tensor = sample_to_tensor(random_training_sample())

input_shape = (1, 60)
classifier_count = 2

# Model
model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=input_shape),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(classifier_count)
])

model.compile(optimizer='adam',
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

input_tensors, target_tensors = all_training_samples()

train_x = tf.concat(input_tensors, 0)
train_y = tf.concat(target_tensors, 0)

model.fit(train_x, train_y, epochs=14)


