from database import *

setup_database()

x, y = get_all_gestures(1)


print(x)
print(type(x[0]))
