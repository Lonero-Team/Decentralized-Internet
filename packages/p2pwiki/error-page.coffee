render = (title, errorText, messageText) ->
    errorPage = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset=UTF-8>
        <title>#{title}</title>
        <style>
        body {
            background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAABlBMVEXW2N7x8fFtFbdeAAAAKUlEQVR42jXKAQoAAAjCQPf/T8egCaEcbcxgA8MkjhcvsVmapBqJgb4PC6kAOLAu0ikAAAAASUVORK5CYII=');
        }
        section {
            background-color: white;
            width: 490px;
            box-shadow: 2px 1px 4px rgba(0,0,0,0.2),
                        inset 0px 0px 40px 0px pink;
            padding: 30px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        header {
            margin: 0px;
        }
        header h1:before {
            content: '';
            background: linear-gradient(135deg, #FE9B36, #507D1A);
            width: 32px;
            height: 32px;
            display: inline-block;
            margin-right: 10px;
            margin-bottom: -6px;
        }
        header h1 {
            margin-top: 0px;
        }
        </style>
    </head>
    <body>
        <section id="nowiki">
        <header>
            <h1>Oops!</h1>
            <p>#{errorText}</p>
        </header>
        <p>#{messageText}</p>
        </section>
    </body>
    </html>
    """

module.exports = {render}