/* eslint-env browser */

'use strict';

// Wrap the module in a universal module definition (UMD), allowing us to
// either include it as a <script> or to `require` it as a CommonJS module.
(function(root, initModule) {
  if (typeof exports === 'object') {
    module.exports = initModule;
  } else {
    initModule(root.ohm, root.ohmEditor, root.CheckedEmitter, root.document, root.cmUtil, root.d3,
               root.domUtil);
  }
})(this, function(ohm, ohmEditor, CheckedEmitter, document, cmUtil, d3, domUtil) {
  var ArrayProto = Array.prototype;
  var $ = domUtil.$;

  var UnicodeChars = {
    ANTICLOCKWISE_OPEN_CIRCLE_ARROW: '\u21BA',
    HORIZONTAL_ELLIPSIS: '\u2026',
    MIDDLE_DOT: '\u00B7'
  };

  // The root trace node from the last time the input was parsed (not affected by zooming).
  var rootTrace;

  var zoomState = {};

  var inputMark;
  var grammarMark;
  var defMark;

  var nextNodeId = 0;

  // D3 Helpers
  // ----------

  function currentHeightPx(optEl) {
    return (optEl || this).offsetHeight + 'px';
  }

  function tweenWithCallback(endValue, cb) {
    return function tween(d, i, a) {
      var interp = d3.interpolate(a, endValue);
      return function(t) {
        var stepValue = interp.apply(this, arguments);
        cb(stepValue);
        return stepValue;
      };
    };
  }

  // Parse tree helpers
  // ------------------

  function getFreshNodeId() {
    return 'node-' + nextNodeId++;
  }

  function measureChildren(el, collapsed) {
    var children = el.lastChild;
    var oldHeight = children.style.height;
    var oldWidth = children.style.width;

    console.log('collapsed', collapsed);

    children.style.height = '';
    children.style.width = collapsed ? '0' : '';

    var result = {
      width: children.offsetWidth,
      height: children.offsetHeight
    };

//    children.style.height = oldHeight;
//    children.style.width = oldWidth;
    return result;    
  }

  function measureLabel(wrapperEl) {
    var tempWrapper = $('#measuringDiv .pexpr');
    var labelClone = wrapperEl.querySelector('.label').cloneNode(true);
    var clone = tempWrapper.appendChild(labelClone);
    var result = {
      width: clone.offsetWidth,
      height: clone.offsetHeight
    };
    tempWrapper.innerHTML = '';
    return result;
  }

  function measureInput(inputEl) {
    if (!inputEl) {
      return 0;
    }
    var measuringDiv = $('#measuringDiv');
    var span = measuringDiv.appendChild(domUtil.createElement('span.input'));
    span.innerHTML = inputEl.textContent;
    var result = {
      width: span.clientWidth,
      height: span.clientHeight
    };
    measuringDiv.removeChild(span);
    return result;
  }

/*
  function initializeWidths() {
    var els = getWidthDependentElements($('.pexpr'));

    // First, ensure that each pexpr node must be as least as wide as the width
    // of its associated input text.
    for (var i = 0; i < els.length; ++i) {
      var el = els[i];
      el.style.minWidth = measureInput(el._input).width + 'px';
    }

    // Then, set the initial widths of all the input elements.
    updateInputWidths(els);
  }

  // Returns an array of elements whose width could depend on `el`, including
  // the element itself.
  function getWidthDependentElements(el) {
    var els = [el];
    // Add all ancestor pexpr nodes.
    var node = el;
    while ((node = node.parentNode) !== document) {
      if (node.classList.contains('pexpr')) {
        els.push(node);
      }
    }
    // And add all descendent pexpr nodes.
    return els.concat(ArrayProto.slice.call(el.querySelectorAll('.pexpr')));
  }

  // For each pexpr div in `els`, updates the width of its associated input
  // span based on the current width of the pexpr. This ensures the input text
  // for each pexpr node appears directly above it in the visualization.
  function updateInputWidths(els) {
    for (var i = 0; i < els.length; ++i) {
      var el = els[i];
      if (!el._input) {
        continue;
      }
      el._input.style.minWidth = el.offsetWidth + 'px';
      if (!el.style.minWidth) {
        el.style.minWidth = measureInput(el._input).width + 'px';
      }
    }
  }
*/
  function updateInputWidths() {
    domUtil.$$('.pexpr.leaf > .children > .input').forEach(function(span) {
      var leaf = span.parentElement.parentElement;
      leaf._input.style.left = span.getBoundingClientRect().left + 'px';
    });
  }

  function clearMarks() {
    inputMark = cmUtil.clearMark(inputMark);
    grammarMark = cmUtil.clearMark(grammarMark);
    defMark = cmUtil.clearMark(defMark);
    ohmEditor.ui.grammarEditor.getWrapperElement().classList.remove('highlighting');
    ohmEditor.ui.inputEditor.getWrapperElement().classList.remove('highlighting');
  }

  // Hides or shows the children of `el`, which is a div.pexpr.
  function toggleTraceElement(el, optDurationInMs) {
    var children = el.lastChild;
    var isCollapsed = el.classList.contains('collapsed');
    setTraceElementCollapsed(el, !isCollapsed, optDurationInMs);
  }

  // Hides or shows the children of `el`, which is a div.pexpr.
  function setTraceElementCollapsed(el, collapse, optDurationInMs) {
    var duration = optDurationInMs != null ? optDurationInMs : 500;
    var children = el.lastChild;

    // NOTE: Ensure that `measureChildren` is called after reading offsetWidth/offsetHeight
    // of any element, otherwise we incur an unnecessary layout.
    var currentWidth = el.offsetWidth;
    var currentChildrenHeight = children.offsetHeight;
    var desiredChildrenSize = measureChildren(el, collapse);

    var newWidth = desiredChildrenSize.width;

    d3.select(el)
        .style('width', currentWidth + 'px')
        .transition().duration(duration)
        .styleTween('width', tweenWithCallback(newWidth + 'px', updateInputWidths))
        .each('end', function() {
          this.style.width = '';
        });

    var newHeight = collapse ? 0 : desiredChildrenSize.height;
    d3.select(children)
        .style('height', currentChildrenHeight)
        .style('width', '')  // Unlock the width.
        .transition().duration(duration)
        .style('height', newHeight + 'px')
        .each('end', function() {
          this.style.width = newWidth + 'px';  // Lock the width to the label width.
        });

    console.log('newWidth', newWidth);
    console.log('newHeight', newHeight);

    if (duration === 0) {
      d3.timer.flush();
    }
    ohmEditor.parseTree.emit((collapse ? 'collapse' : 'expand') + ':traceElement', el);
    el.classList.toggle('collapsed', collapse);
  }

  function updateZoomState(newState) {
    for (var k in newState) {
      if (newState.hasOwnProperty(k)) {
        zoomState[k] = newState[k];
      }
    }
    refreshParseTree(rootTrace);
  }

  function clearZoomState() {
    zoomState = {};
    refreshParseTree(rootTrace);
  }

  function shouldNodeBeLabeled(traceNode, parent) {
    var expr = traceNode.expr;

    // Don't label Seq and Alt nodes.
    if (expr instanceof ohm.pexprs.Seq || expr instanceof ohm.pexprs.Alt) {
      return false;
    }

    // Hide successful nodes that have no bindings.
    if (traceNode.succeeded && traceNode.bindings.length === 0) {
      return false;
    }

    return true;
  }

  function isAlt(expr) {
    return expr instanceof ohm.pexprs.Alt;
  }

  function isSyntactic(expr) {
    if (expr instanceof ohm.pexprs.Apply) {
      return expr.isSyntactic();
    }
    if (expr instanceof ohm.pexprs.Iter ||
        expr instanceof ohm.pexprs.Lookahead ||
        expr instanceof ohm.pexprs.Not) {
      return isSyntactic(expr.expr);
    }
    return false;
  }

  // Return true if the trace element `el` should be collapsed by default.
  function shouldTraceElementBeCollapsed(el, traceNode) {
    // Don't collapse unlabeled nodes (they can't be expanded), nodes with a collapsed ancestor,
    // or leaf nodes.
    if (el.classList.contains('hidden') ||
        domUtil.closestElementMatching('.collapsed', el) != null ||
        isLeaf(traceNode)) {
      return false;
    }

    // Collapse uppermost failure nodes.
    if (!traceNode.succeeded) {
      return true;
    }

    // Collapse the trace if the next labeled ancestor is syntactic, but the node itself isn't.
    var visualParent = domUtil.closestElementMatching('.pexpr:not(.hidden)', el.parentElement);
    if (visualParent && visualParent._traceNode) {
      return isSyntactic(visualParent._traceNode.expr) && !isSyntactic(traceNode.expr);
    }

    return false;
  }

  /*
    When showing failures, the nodes representing the branches (choices) of an Alt node are
    stacked vertically. E.g., for a rule `width = pctWidth | pxWidth` where `pctWidth` fails,
    the nodes are layed out like this:

        width
        pctWidth
        pxWidth

    Since this could be confused with `pctWidth` being the parent node of `pxWidth`, we need
    to distinguish choice nodes visually when showing failures. This function returns true if
    `traceNode` is an Alt node whose children should be visually distinguished.
  */
  function hasVisibleChoice(traceNode) {
    if (isAlt(traceNode.expr) && ohmEditor.options.showFailures) {
      // If there's any failed child, we need to show multiple children.
      return traceNode.children.some(function(c) {
        return !c.succeeded;
      });
    }
    return false;
  }

  // Return true if `traceNode` should be treated as a leaf node in the parse tree.
  function isLeaf(traceNode) {
    var pexpr = traceNode.expr;
    if (isPrimitive(pexpr)) {
      return true;
    }
    if (pexpr instanceof ohm.pexprs.Apply) {
      // If the rule body has no interval, treat its implementation as opaque.
      var body = ohmEditor.grammar.ruleBodies[pexpr.ruleName];
      if (!body.interval) {
        return true;
      }
    }
    if (isLRBaseCase(traceNode)) {
      return true;
    }
    return traceNode.children.length === 0;
  }

  function isPrimitive(expr) {
    return expr instanceof ohm.pexprs.Terminal ||
           expr instanceof ohm.pexprs.Range ||
           expr instanceof ohm.pexprs.UnicodeChar;
  }

  function isLRBaseCase(traceNode) {
    // If the children are exactly `[undefined]`, it's the base case for left recursion.
    // TODO: Figure out a better way to handle this when generating traces.
    return traceNode.children.length === 1 && traceNode.children[0] == null;
  }

  function hasVisibleLeftRecursion(traceNode) {
    return ohmEditor.options.showFailures && traceNode.terminatingLREntry != null;
  }

  function couldZoom(currentRootTrace, traceNode) {
    return currentRootTrace !== traceNode &&
           traceNode.succeeded &&
           !isLeaf(traceNode);
  }

  // Handle the 'contextmenu' event `e` for the DOM node associated with `traceNode`.
  function handleContextMenu(e, traceNode) {
    var menuDiv = $('#parseTreeMenu');
    menuDiv.style.left = e.clientX + 'px';
    menuDiv.style.top = e.clientY - 6 + 'px';
    menuDiv.hidden = false;

    var currentRootTrace = zoomState.zoomTrace || rootTrace;
    var zoomEnabled = couldZoom(currentRootTrace, traceNode);

    domUtil.addMenuItem('parseTreeMenu', 'getInfoItem', 'Get Info', false);
    domUtil.addMenuItem('parseTreeMenu', 'zoomItem', 'Zoom to Node', zoomEnabled, function() {
      updateZoomState({zoomTrace: traceNode});
      clearMarks();
    });
    ohmEditor.parseTree.emit('contextMenu', e.target, traceNode);

    e.preventDefault();
    e.stopPropagation();  // Prevent ancestor wrappers from handling.
  }

  // Create the DOM node that contains the parse tree for `traceNode` and all its children.
  function createTraceWrapper(traceNode) {
    var el = domUtil.createElement('.pexpr');
    var ctorName = traceNode.expr.constructor.name;
    el.classList.add(ctorName.toLowerCase());
    return el;
  }

  function createTraceLabel(traceNode, optExtraInfo) {
    var pexpr = traceNode.expr;
    var label = domUtil.createElement('.label');

    if (traceNode.terminatesLR) {
      label.textContent = '[Grow LR]';
      return label;
    }

    var isInlineRule = pexpr.ruleName && pexpr.ruleName.indexOf('_') >= 0;

    if (isInlineRule) {
      var parts = pexpr.ruleName.split('_');
      label.textContent = parts[0];
      label.appendChild(domUtil.createElement('span.caseName', parts[1]));
      if (optExtraInfo) {
        label.appendChild(domUtil.createElement('span.info', ' ' + optExtraInfo));
      }
    } else {
      var labelText = traceNode.displayString;

      // Truncate the label if it is too long, and show the full label in the tooltip.
      if (labelText.length > 20 && labelText.indexOf(' ') >= 0) {
        label.setAttribute('title', labelText);
        labelText = labelText.slice(0, 20) + UnicodeChars.HORIZONTAL_ELLIPSIS;
      }
      label.textContent = labelText;
      if (optExtraInfo) {
        label.textContent += optExtraInfo;
      }
    }
    return label;
  }

  function createTraceElement(traceNode, parent, input) {
    var pexpr = traceNode.expr;
    var wrapper = parent.appendChild(createTraceWrapper(traceNode));
    wrapper._input = input;
    wrapper._traceNode = traceNode;
    wrapper.id = getFreshNodeId();

    if (zoomState.zoomTrace === traceNode && zoomState.previewOnly) {
      if (input) {
        input.classList.add('highlight');
      }
      wrapper.classList.add('zoomBorder');
    }

    var info = isLRBaseCase(traceNode) ? '[LR]' : null;

    var selfWrapper = wrapper.appendChild(domUtil.createElement('.self'));
    var label = selfWrapper.appendChild(createTraceLabel(traceNode, info));

    label.addEventListener('click', function(e) {
      var isPlatformMac = /Mac/.test(navigator.platform);
      var modifierKey = isPlatformMac ? e.metaKey : e.ctrlKey;

      if (e.altKey && !(e.shiftKey || e.metaKey)) {
        console.log(traceNode);  // eslint-disable-line no-console
      } else if (modifierKey && !(e.altKey || e.shiftKey)) {
        // cmd/ctrl + click to open or close semantic editor
        ohmEditor.parseTree.emit('cmdOrCtrlClick:traceElement', wrapper);
      } else if (!isLeaf(traceNode)) {
        toggleTraceElement(wrapper);
      }
      e.preventDefault();
    });

    label.addEventListener('mouseover', function(e) {
      var grammarEditor = ohmEditor.ui.grammarEditor;
      var inputEditor = ohmEditor.ui.inputEditor;

      if (input) {
        input.classList.add('highlight');
      }
      if (traceNode.interval) {
        inputMark = cmUtil.markInterval(inputEditor, traceNode.interval, 'highlight', false);
        inputEditor.getWrapperElement().classList.add('highlighting');
      }
      if (pexpr.interval) {
        grammarMark = cmUtil.markInterval(grammarEditor, pexpr.interval, 'active-appl', false);
        grammarEditor.getWrapperElement().classList.add('highlighting');
        cmUtil.scrollToInterval(grammarEditor, pexpr.interval);
      }
      var ruleName = pexpr.ruleName;
      if (ruleName) {
        var defInterval = ohmEditor.grammar.ruleBodies[ruleName].definitionInterval;
        if (defInterval) {
          defMark = cmUtil.markInterval(grammarEditor, defInterval, 'active-definition', true);
          cmUtil.scrollToInterval(grammarEditor, defInterval);
        }
      }

      e.stopPropagation();
    });

    label.addEventListener('mouseout', function(e) {
      if (input) {
        input.classList.remove('highlight');
      }
      clearMarks();
    });

    label.addEventListener('contextmenu', function(e) {
      handleContextMenu(e, traceNode);
    });

    return wrapper;
  }

  // To make it easier to navigate around the parse tree, handle mousewheel events
  // and translate vertical overscroll into horizontal movement. I.e., when scrolled all
  // the way down, further downwards scrolling instead moves to the right -- and similarly
  // with up and left.
  $('#parseResults').addEventListener('wheel', function(e) {
    var el = e.currentTarget;
    var overscroll;
    var scrollingDown = e.deltaY > 0;

    var bottomSection = $('#bottomSection');

    if (scrollingDown) {
      var scrollBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      overscroll = e.deltaY - scrollBottom;
      if (overscroll > 0) {
        bottomSection.scrollLeft += overscroll;
      }
    } else {
      overscroll = el.scrollTop + e.deltaY;
      if (overscroll < 0) {
        bottomSection.scrollLeft += overscroll;
      }
    }
  });

  // Intialize the zoom out button.
  var zoomOutButton = $('#zoomOutButton');
  zoomOutButton.textContent = UnicodeChars.ANTICLOCKWISE_OPEN_CIRCLE_ARROW;
  zoomOutButton.onclick = function(e) {
    clearZoomState();
  };
  zoomOutButton.onmouseover = function(e) {
    if (zoomState.zoomTrace) {
      updateZoomState({previewOnly: true});
    }
  };
  zoomOutButton.onmouseout = function(e) {
    if (zoomState.zoomTrace) {
      updateZoomState({previewOnly: false});
    }
  };

  // Re-render the parse tree starting with `trace` as the root.
  function refreshParseTree(trace) {
    var expandedInputDiv = $('#expandedInput');
    var parseResultsDiv = $('#parseResults');

    expandedInputDiv.innerHTML = '';
    parseResultsDiv.innerHTML = '';

    var renderedTrace = trace;
    if (zoomState.zoomTrace && !zoomState.previewOnly) {
      renderedTrace = zoomState.zoomTrace;
    }
    zoomOutButton.hidden = zoomState.zoomTrace == null;

    var rootWrapper = parseResultsDiv.appendChild(createTraceWrapper(renderedTrace));
    var rootContainer = rootWrapper.appendChild(domUtil.createElement('.children'));

    var inputStack = [expandedInputDiv];
    var containerStack = [rootContainer];

    ohmEditor.parseTree.emit('render:parseTree', renderedTrace);
    var renderActions = {
      enter: function handleEnter(node, parent, depth) {
        // Don't show or recurse into nodes that didn't succeed, unless "Show failures" is enabled.
        if ((!node.succeeded && !ohmEditor.options.showFailures) ||
            (node.isImplicitSpaces && !ohmEditor.options.showSpaces)) {
          return node.SKIP;
        }
        // Don't bother showing whitespace nodes that didn't consume anything.
        var isWhitespace = node.expr.ruleName === 'spaces';
        if (isWhitespace && node.interval.contents.length === 0) {
          return node.SKIP;
        }
        var isLabeled = shouldNodeBeLabeled(node, parent);
        var isLeafNode = isLeaf(node);
        var visibleChoice = hasVisibleChoice(node);
        var visibleLR = hasVisibleLeftRecursion(node);

        // Get the span that contain the parent node's input. If it is undefined, it means that
        // this node is in a failed branch.
        var inputContainer = inputStack[inputStack.length - 1];

        var childInput;
        if (inputContainer && node.succeeded) {
          var contents = isLeafNode ? node.interval.contents : '';
          childInput = inputContainer.appendChild(domUtil.createElement('span.input', contents));

          // Represent any non-empty run of whitespace as a single dot.
          if (isWhitespace && contents.length > 0) {
            childInput.innerHTML = UnicodeChars.MIDDLE_DOT;
            childInput.classList.add('whitespace');
          }
        }

        var container = containerStack[containerStack.length - 1];
        var el = createTraceElement(node, container, childInput);

        var isVBoxItem = container.classList.contains('vbox');
        var useDisclosure = isLabeled && isVBoxItem;

        domUtil.toggleClasses(el, {
          disclosure: useDisclosure,
          failed: !node.succeeded,
          hidden: !isLabeled,
          leaf: isLeafNode
        });

        var children = el.appendChild(domUtil.createElement('.children'));
        children.classList.toggle(
            'vbox', visibleChoice || visibleLR || (isAlt(node.expr) && isVBoxItem));

        ohmEditor.parseTree.emit('create:traceElement', el, node);

        if (isLeafNode) {
          if (childInput) children.appendChild(childInput.cloneNode(true));
          return node.SKIP;
        }
        inputStack.push(childInput);
        containerStack.push(children);
      },
      exit: function(node, parent, depth) {
        // If necessary, render the "Grow LR" trace as a pseudo-child, after the real child.
        if (hasVisibleLeftRecursion(node)) {
          node.terminatingLREntry.walk(renderActions);
        }
        var childContainer = containerStack.pop();
        var el = childContainer.parentElement;
        inputStack.pop();

        ohmEditor.parseTree.emit('exit:traceElement', el, node);

        var isCollapsed = shouldTraceElementBeCollapsed(el, node);
        if (isCollapsed) {
//          setTraceElementCollapsed(el, true, 0);
        }
      }
    };
    renderedTrace.walk(renderActions);

    // If the match failed, add the unconsumed input to #expandedInput.
    if (trace.result.failed()) {
      var firstFailedEl = domUtil.$('#parseResults > .pexpr > .children > .pexpr.failed');
      var remainingInput = trace.inputStream.sourceSlice(firstFailedEl._traceNode.pos);
      expandedInputDiv.appendChild(domUtil.createElement('span.input.unconsumed', remainingInput));
    }
    updateInputWidths();
//    initializeWidths();


    // Hack to ensure that the vertical scroll bar doesn't overlap the parse tree contents.
    parseResultsDiv.style.paddingRight =
        2 + parseResultsDiv.scrollWidth - parseResultsDiv.clientWidth + 'px';
  }

  // When the user makes a change in either editor, show the bottom overlay to indicate
  // that the parse tree is out of date.
  function showBottomOverlay(changedEditor) {
    $('#bottomSection .overlay').style.width = '100%';
  }
  ohmEditor.addListener('change:inputEditor', showBottomOverlay);
  ohmEditor.addListener('change:grammarEditor', showBottomOverlay);

  // Refresh the parse tree after attempting to parse the input.
  ohmEditor.addListener('parse:input', function(matchResult, trace) {
    $('#bottomSection .overlay').style.width = 0;  // Hide the overlay.
    $('#semantics').hidden = !ohmEditor.options.semantics;
    rootTrace = trace;
    clearZoomState();
  });

  // Exports
  // -------

  var parseTree = ohmEditor.parseTree = new CheckedEmitter();
  parseTree.refresh = function() {
    clearMarks();
    refreshParseTree(rootTrace);
  };
  parseTree.setTraceElementCollapsed = setTraceElementCollapsed;
  parseTree.registerEvents({
    // Emitted when a new trace element `el` is created for `traceNode`.
    'create:traceElement': ['el', 'traceNode'],

    // Emitted when all of a trace element's subtrees have been created.
    'exit:traceElement': ['el', 'traceNode'],

    // Emitted when a trace element is expanded or collapsed.
    'expand:traceElement': ['el'],
    'collapse:traceElement': ['el'],

    // Emitted when the contextMenu for the trace element of `traceNode` is about to be shown.
    // TODO: The key should be quoted to be consistent, but JSCS complains.
    contextMenu: ['target', 'traceNode'],

    // Emitted before start rendering the parse tree
    'render:parseTree': ['traceNode'],

    // Emitted after cmd/ctrl + 'click' on a label
    'cmdOrCtrlClick:traceElement': ['wrapper']
  });
});
