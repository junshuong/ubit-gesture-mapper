from pony.orm import *

db = Database()


class Model(db.Entity):
    name = Required(str)
    description = Required(str)
    gestures = Set('Gesture')
    tickCount = Required(int)


class Gesture(db.Entity):
    model = Required(Model)
    data = Set('DataTick')
    classification = Required(bool)


class DataTick(db.Entity):
    accel_x = Required(float)
    accel_y = Required(float)
    accel_z = Required(float)
    magnet_x = Required(float)
    magnet_y = Required(float)
    magnet_z = Required(float)
    gesture = Required(Gesture)


def setup_database():
    db.bind(provider='sqlite', filename='main.db', create_db=True)
    db.generate_mapping(create_tables=True)


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


@db_session
def get_all_gestures(model_id):
    current_model = Model[model_id]

    result = select((g.id, g.classification, d.accel_x, d.accel_y, d.accel_z, d.magnet_x, d.magnet_y, d.magnet_z, d.id)
                    for g in current_model.gestures
                    for d in g.data)[:]
    print(f"len res: {len(result)}")
    return result


@db_session
def add_model(name, description, tickCount):
    model = Model(name=name, description=description, tickCount=tickCount)
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
def get_gesture_model(model_id):
    return Model[model_id].to_dict(with_collections=True)
