import mysql.connector
import glob
import os
import re
import environ

os.chdir("./finote_api/fixtures/init")

def execute_scripts_from_file(filename):
    fd = open(filename, 'r')
    lines = fd.readlines()
    fd.close()
    lines_strip = [line.strip() for line in lines]
    sqlCommands = [line for line in lines_strip if 'INSERT' in line]

    print(filename)

    for command in sqlCommands:
        try:
            cursor.execute(command)
        except IOError:
            print('Command skipped: ' + command)

def get_sql_files():
    sql_files = glob.glob('./*.sql')
    sql_files.sort()
    return sql_files

def main():
    for sql_file in get_sql_files():
        execute_scripts_from_file(sql_file)
        cnx.commit()

if __name__ == "__main__":
    env = environ.Env()
    env.read_env('../../../myapi/.env')

    if bool(env('IS_INSERT_LARGE_DATA')) == True:
        config = {
            'user': os.environ['MYSQL_USER'],
            'password': os.environ['MYSQL_PASSWORD'],
            'host': os.environ['MYSQL_HOST'],
            'database' : os.environ['MYSQL_DATABASE'],
        }
        cnx = mysql.connector.connect(**config)
        cursor = cnx.cursor()

        main()
        cursor.close()
        cnx.close()
