from pony.orm import *

db = Database()

db.bind(provider='sqlite', filename='database.sqlite', create_db=True)

class Gesture(db.Entity):
    data = Set('DataTick')
    classification = Required(bool)

class DataTick(db.Entity):
    accelerometerX = Required(float)
    accelerometerY = Required(float)
    accelerometerZ = Required(float)
    gesture = Required(Gesture)

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