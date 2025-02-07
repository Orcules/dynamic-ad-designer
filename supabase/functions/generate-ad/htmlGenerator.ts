export function generateAdHtml(data: any, imageBase64: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('${data.font_url}');
          body {
            margin: 0;
            padding: 0;
            width: ${data.width}px;
            height: ${data.height}px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
          }
          .container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${data.overlay_color};
            opacity: ${data.overlayOpacity};
          }
          .content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
            color: ${data.text_color};
            font-family: '${data.font_url.split('family=')[1]?.split(':')[0]?.replace(/\+/g, ' ')}', sans-serif;
          }
          .headline {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          .description {
            font-size: 18px;
            margin-bottom: 24px;
            color: ${data.description_color};
          }
          .cta {
            padding: 12px 24px;
            background: ${data.cta_color};
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="data:image/jpeg;base64,${imageBase64}" class="image" />
          <div class="overlay"></div>
          <div class="content">
            <div class="headline">${data.headline}</div>
            ${data.description ? `<div class="description">${data.description}</div>` : ''}
            <button class="cta">${data.cta_text}</button>
          </div>
        </div>
      </body>
    </html>
  `;
}