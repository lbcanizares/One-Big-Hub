# One-Big-Hub
A simple system that allows the students, faculty, and staff of Ateneo de Naga University to buy, sell, rent, or trade items such as used books, uniforms, or anything under the sun.

How to Run
1. Open Terminal
2. Enter "python -m venv venv"
3. Enter "venv\Scripts\activate"
4. pip install Flask flask-cors Flask-SQLAlchemy pymysql

How to create db
Enter the ff:
1. python
2. from app import app, db
3. app.app_context().push(); db.create_all()
Optional:
4. db.inspect(db.engine).get_table_names() # To Check
5. Exit()

