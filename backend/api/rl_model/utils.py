# api/rl_model/utils.py
def safe_eval(value):
    import ast
    if isinstance(value, str):
        try:
            return ast.literal_eval(value)
        except (SyntaxError, ValueError):
            return []
    elif isinstance(value, list):
        return value
    else:
        return []