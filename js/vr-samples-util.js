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
    var messageContainer = document.getElementById("vr-sample-message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "vr-sample-message-container";
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
    messageElement.classList.add = "vr-sample-message";
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

  // Makes the given element fade out and remove itself from the DOM after the
  // given timeout
  function makeToast(element, timeout) {
    element.style.transition = "opacity 0.5s ease-in-out";
    element.style.opacity = "1";
    setTimeout(function() {
      element.style.opacity = "0";
      setTimeout(function() {
        if (element.parentElement)
          element.parentElement.removeChild(element);
      }, 500);
    }, timeout);
  }

  function addError(message, timeout) {
    var element = addMessageElement("<b>ERROR:</b> " + message, "#D33");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function addInfo(message, timeout) {
    var element = addMessageElement(message, "#22A");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function getButtonContainer() {
    var buttonContainer = document.getElementById("vr-sample-button-container");
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.id = "vr-sample-button-container";
      buttonContainer.style.fontFamily = "sans-serif";
      buttonContainer.style.position = "absolute";
      buttonContainer.style.zIndex = "999";
      buttonContainer.style.left = "0";
      buttonContainer.style.bottom = "0";
      buttonContainer.style.right = "0";
      buttonContainer.style.margin = "0";
      buttonContainer.style.padding = "0";
      buttonContainer.align = "right";
      document.body.appendChild(buttonContainer);
    }
    return buttonContainer;
  }

  function addButtonElement(message, icon) {
    var buttonElement = document.createElement("div");
    buttonElement.classList.add = "vr-sample-button";
    buttonElement.style.color = "#FFF";
    buttonElement.style.fontWeight = "bold";
    buttonElement.style.backgroundColor = "#888";
    buttonElement.style.borderRadius = "5px";
    buttonElement.style.border = "3px solid #555";
    buttonElement.style.position = "relative";
    buttonElement.style.display = "inline-block";
    buttonElement.style.margin = "0.5em";
    buttonElement.style.padding = "0.75em";
    buttonElement.style.cursor = "pointer";
    buttonElement.align = "center";

    if (icon) {
      buttonElement.innerHTML = "<img src='" + icon + "'/><br/>" + message;
    } else {
      buttonElement.innerHTML = message;
    }

    getButtonContainer().appendChild(buttonElement);

    return buttonElement;
  }

  function addButton(message, icon, callback) {
    var element = addButtonElement(message, icon);
    element.addEventListener("click", callback, false);
    return element;
  }

  function removeButton(button) {
    if (button && button.parentElement)
      button.parentElement.removeChild(button);
  }

  return {
    addError: addError,
    addInfo: addInfo,
    addButton: addButton,
    removeButton: removeButton
  };
})();
