from pony.orm import *

db = Database()


class Model(db.Entity):
    name = Required(str)
    description = Optional(str)
    gestures = Set('Gesture')


class Gesture(db.Entity):
    model = Required(Model)
    name = Optional(str)
    captures = Set('GestureCapture')
    classification = Required(int)
    using_file = Required(bool)
    sound_file = Optional(str)
    frequency = Optional(float)
    strength = Optional(float)
    volume = Optional(float)


class GestureCapture(db.Entity):
    data = Set('DataTick')
    gesture = Required(Gesture)
    classification = Required(int)


class DataTick(db.Entity):
    accel_x = Required(float)
    accel_y = Required(float)
    accel_z = Required(float)
    magnet_x = Required(float)
    magnet_y = Required(float)
    magnet_z = Required(float)
    capture = Required(GestureCapture)


def setup_database():
    db.bind(provider='sqlite', filename='main.db', create_db=True)
    db.generate_mapping(create_tables=True)


@db_session
def get_gesture_from_db(gesture_id):
    return Gesture[gesture_id].to_dict()

@db_session
def create_gesture(name, model_id, classification):
    Gesture(model=model_id, name=name, classification=classification, using_file=False)
    commit()

@db_session
def delete_gesture(gesture_id):
    Gesture[gesture_id].delete()
    commit()

@db_session
def create_capture(classification, accel_data, magnet_data, gesture_id):
    capture = GestureCapture(gesture=Gesture[gesture_id], classification=classification)
    for accel, mag in zip(accel_data, magnet_data):
        DataTick(
            accel_x=accel["x"],
            accel_y=accel["y"],
            accel_z=accel["z"],
            magnet_x=mag["x"],
            magnet_y=mag["y"],
            magnet_z=mag["z"],
            capture=capture
        )
    commit()

@db_session
def add_gesture(checked, accel_data, magnet_data, model_id):
    ges = Gesture(classification=checked, model=model_id)
    for accel, mag in zip(accel_data, magnet_data):
        DataTick(
            accel_x=accel["x"],
            accel_y=accel["y"],
            accel_z=accel["z"],
            magnet_x=mag["x"],
            magnet_y=mag["y"],
            magnet_z=mag["z"],
            gesture=ges
        )
    commit()

def build_gesture(id, name, classification):
    return {"id": id, "name": name, "classification": classification}

@db_session
def add_model_gestures(model_id):
    m = Model[model_id]
    return select (build_gesture(g.id, g.name, g.classification) for g in m.gestures)


@db_session
def get_classifier_count(model_id):
    m = Model[model_id]
    return len(m.gestures)


@db_session
def get_all_gestures(model_id):
    cm = Model[model_id]
    ca = select(g.captures for g in cm.gestures)
    all_x = []
    all_y = []

    for c in ca:
        x_data = select([d.accel_x, d.accel_y, d.accel_z, d.magnet_x, d.magnet_y, d.magnet_z] for d in c.data)[:]
        y_data = select([c.classification] for d in c.data)[:]
        all_x.append(list(x_data))
        all_y.append(list(y_data))

    return all_x, all_y


@db_session
def add_model(name, description):
    Model(name=name, description=description)
    commit()


@db_session
def get_all_models():
    result = select((m.id, m.name, m.description) for m in Model)[:]
    return [{"id": i, "name": v, "description": d} for i, v, d in result]


@db_session
def delete_gesture_model(model_id):
    Model[model_id].delete()
    commit()


@db_session
def get_model_from_db(model_id):
    models = Model[model_id].to_dict(with_collections=True, related_objects=True)
    models["gestures"] = [mg.to_dict() for mg in models["gestures"]]
    return models

@db_session
def update_mapping_db(gesture_id, using_file, file_name):
    gesture = Gesture[gesture_id]
    gesture.set(using_file=using_file, sound_file=file_name)
    commit()

