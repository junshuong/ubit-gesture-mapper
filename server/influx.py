"""Handle all operations relating to InfluxDB """

__author__ = "Dylan Gore"

import logging
from datetime import datetime

import toml
from flask import Response
from influxdb_client import InfluxDBClient, WriteOptions


def write_to_influx(gesture_name, fields):
    '''Write data to InfluxDB and return a Flask response'''
    # Attempt to load the config_file file
    try:
        config_file = toml.load('config_file.toml')['influxdb']
    except (FileNotFoundError, KeyError):
        logging.error('config_file file not found.')

    influx_protocol = "http"
    if config_file['tls']:
        influx_protocol = "https"

    # Initalize database collection
    _client = InfluxDBClient(url=f"{influx_protocol}://{config_file['host']}:{config_file['port']}",
                             verify_ssl=config_file['verify_tls'], org=config_file['organization'],
                             token=config_file['token'])

    # pylint: disable=line-too-long
    _write_client = _client.write_api(write_options=WriteOptions(batch_size=500, flush_interval=10_000, jitter_interval=2_000, retry_interval=5_000,
                                                                 max_retries=5, max_retry_delay=30_000, exponential_base=2))

    # Add the data in JSON format
    json_body = {
        "measurement": gesture_name,
        "tags": {},
        "time": datetime.utcnow().isoformat(),
        "fields": fields
    }

    # Attempt to write the list of datapoints to the database
    try:
        logging.info(json_body)
        # Write the JSON object into the database
        _write_client.write(config_file['bucket'], config_file['organization'], json_body)
        _write_client.__del__()
        logging.info('Data written to DB (%d) items)', len(json_body))
        # Close the connection to InfluxDB
        _client.close()
        return Response(status=201)
    # pylint: disable=broad-except
    except Exception as err:
        logging.error('Error writing to DB - %s', err)
        # Close the connection to InfluxDB
        _client.close()
        return Response(status=500)
