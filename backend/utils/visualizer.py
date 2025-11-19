def prepare_visualization_data(chart_type, data):
    if len(data) == 0:
        return {"error": "No data returned"}

    keys = list(data[0].keys())

    if chart_type == "bar" or chart_type == "line":
        return {
            "labels": [row[keys[0]] for row in data],
            "values": [row[keys[1]] for row in data]
        }

    if chart_type == "pie":
        return {
            "labels": [row[keys[0]] for row in data],
            "values": [row[keys[1]] for row in data]
        }

    return {"error": "Unsupported chart type"}
