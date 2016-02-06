/* global define, module */
/*jshint multistr: true */

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

(function () {
  "use strict";

  function getMessageContainer () {
    var messageContainer = document.getElementById("message-container");
    if (!messageContainer) {
      messageContainer = document.createElement("div");
      messageContainer.id = "message-container";
      messageContainer.cssText = "\
        font-family: sans-serif;\
        left: 0;\
        margin: 0;\
        padding: 0;\
        position: absolute;\
        right: 0;\
        text-align: center;\
        top: 0;\
        zIndex: -9999px;";
      document.body.appendChild(messageContainer);
    }
    return messageContainer;
  }

  function addMessageElement(message, backgroundColor) {
    var messageElement = document.createElement("div");
    messageElement.cssText = "\
      color: #fff;\
      background-color = " + backgroundColor + ";\
      borderRadius: 3px;\
      position: relative;\
      display: inline-block;\
      margin: 0.5em;\
      padding: 0.75em;";

    messageElement.innerHTML = message;

    getMessageContainer().appendChild(messageElement);

    return messageElement;
  }

  // Makes the given element fade out and remove itself from the DOM after the
  // given timeout
  function makeToast(element, timeout) {
    element.cssText = "\
      transition: opacity 0.5s ease-in-out;\
      opacity: 1;";
    setTimeout(function () {
      element.style.opacity = "0";
      setTimeout(function () {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 500);
    }, timeout);
  }

  function addError (message, timeout) {
    var element = addMessageElement("<b>ERROR:</b> " + message, "#D33");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function addInfo (message, timeout) {
    var element = addMessageElement(message, "#22A");

    if (timeout) {
      makeToast(element, timeout);
    }

    return element;
  }

  function getButtonContainer () {
    var buttonContainer = document.getElementById("button-container");
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.id = "button-container";
      buttonContainer.cssText = "\
        bottom: 0;\
        box-sizing: border-box;\
        font-family: sans-serif;\
        left: 0;\
        margin: 0;\
        padding: 0;\
        position: absolute;\
        right: 0;\
        text-align: center;\
        z-index: -9999px;";
      document.body.appendChild(buttonContainer);
    }
    return buttonContainer;
  }

  function addButtonElement (message, icon) {
    var buttonElement = document.createElement("div");
    buttonElement.cssText = "\
      background-color: #888;\
      border-radius: 5px;\
      border: 3px solid #555;\
      color: #fff;\
      cursor: pointer;\
      display: inline-block;\
      font-weight: bold;\
      margin: 0.5em;\
      padding: 0.75em;\
      position: relative;\
      text-align: center;";

    if (icon) {
      buttonElement.innerHTML = "<img src='" + icon + "'><br>" + message;
    } else {
      buttonElement.innerHTML = message;
    }

    getButtonContainer().appendChild(buttonElement);

    return buttonElement;
  }

  function addButton (message, icon, callback) {
    var element = addButtonElement(message, icon);
    element.addEventListener("click", callback, false);
    return element;
  }

  var vrsamplesutil = {
    addError: addError,
    addInfo: addInfo,
    addButton: addButton
  };

  if (typeof define === "function" && define.amd) {
    define("vrsamplesutil", vrsamplesutil);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = vrsamplesutil;
  } else if (window) {
    window.vrsamplesutil = vrsamplesutil;
  }
})();
