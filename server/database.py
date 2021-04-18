from pony.orm import *

db = Database()

class Model(db.Entity):
    name = Required(str)
    gestures = Set('Gesture')
    tickCount = Required(int)

class Gesture(db.Entity):
    model = Required(Model)
    data = Set('DataTick')
    classification = Required(bool)

class DataTick(db.Entity):
    accelerometerX = Required(float)
    accelerometerY = Required(float)
    accelerometerZ = Required(float)
    gesture = Required(Gesture)

def setup_database():
    db.bind(provider='sqlite', filename='database.sqlite', create_db=True)
    db.generate_mapping(create_tables=True)

@db_session
def add_gesture(checked, data):
    ges = Gesture(classification=checked)
    for tick in data:
        DataTick(accelerometerX=tick["x"], accelerometerY=tick["y"], accelerometerZ=tick["z"], gesture=ges)
    commit()

@db_session
def get_all_gestures():
    result = select((g.id, g.classification, d.accelerometerX, d.accelerometerY, d.accelerometerY, d.id)
                    for g in Gesture
                    for d in g.data)[:]
    print(f"len res: {len(result)}")
    return result

@db_session
def add_model(name, tickCount):
    model = Model(name=name, tickCount=tickCount)
    commit()

@db_session
def get_all_models():
    result = select((m.id, m.name) for m in Model)[:]
    return [{"id": i, "name": v} for i, v in result]

@db_session
def delete_gesture_model(model_id):
    Model[model_id].delete()
    commit()

@db_session
def get_gesture_model(model_id):
    return Model[model_id].to_dict(with_collections=True)
