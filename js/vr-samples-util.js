/*
Copyright (c) 2016, Brandon Jones.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var VRSamplesUtil = (function() {

  "use strict";

  function getMessageContainer() {
    var messageContainer = document.getElementById("message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      messageContainer.style.fontFamily = "sans-serif";
      messageContainer.style.position = "absolute";
      messageContainer.style.zIndex = "999";
      messageContainer.style.left = "0";
      messageContainer.style.top = "0";
      messageContainer.style.right = "0";
      messageContainer.style.margin = "0";
      messageContainer.style.padding = "0";
      messageContainer.align = "center";
      document.body.appendChild(messageContainer);
    }
    return messageContainer;
  }

  function addMessageElement(message, backgroundColor) {
    var messageElement = document.createElement("div");
    messageElement.style.color = "#FFF";
    messageElement.style.backgroundColor = backgroundColor;
    messageElement.style.borderRadius = "3px";
    messageElement.style.position = "relative";
    messageElement.style.display = "inline-block";
    messageElement.style.margin = "0.5em";
    messageElement.style.padding = "0.75em";

    messageElement.innerHTML = message;

    getMessageContainer().appendChild(messageElement);

    return messageElement;
  }

  function addError(message) {
    return addMessageElement("<b/>ERROR:</b> " + message, "#D33");
  }

  function addInfo(message) {
    return addMessageElement(message, "#22A");
  }

  return {
    addError: addError,
    addInfo: addInfo
  };
})();
