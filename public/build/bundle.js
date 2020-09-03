
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules/@colorfuldots/svelteit/src/Button.svelte generated by Svelte v3.24.0 */

    const file = "node_modules/@colorfuldots/svelteit/src/Button.svelte";

    // (352:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block_1 = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block.name,
    		type: "else",
    		source: "(352:2) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (350:2) {#if title}
    function create_if_block(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*title*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block.name,
    		type: "if",
    		source: "(350:2) {#if title}",
    		ctx
    	});

    	return block_1;
    }

    // (353:10)        
    function fallback_block(ctx) {
    	let em;

    	const block_1 = {
    		c: function create() {
    			em = element("em");
    			em.textContent = "Button is empty";
    			add_location(em, file, 353, 6, 12823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, em, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(em);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(353:10)        ",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment(ctx) {
    	let button;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*title*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let button_levels = [{ type: /*type*/ ctx[17] }, { class: "svelteit-button" }, /*$$props*/ ctx[18]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "primary", /*primary*/ ctx[1]);
    			toggle_class(button, "secondary", /*secondary*/ ctx[2]);
    			toggle_class(button, "success", /*success*/ ctx[3]);
    			toggle_class(button, "danger", /*danger*/ ctx[4]);
    			toggle_class(button, "warning", /*warning*/ ctx[5]);
    			toggle_class(button, "info", /*info*/ ctx[6]);
    			toggle_class(button, "light", /*light*/ ctx[7]);
    			toggle_class(button, "dark", /*dark*/ ctx[8]);
    			toggle_class(button, "outline", /*outline*/ ctx[10]);
    			toggle_class(button, "small", /*small*/ ctx[11]);
    			toggle_class(button, "medium", /*medium*/ ctx[12]);
    			toggle_class(button, "large", /*large*/ ctx[13]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[9]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[14]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[15]);
    			toggle_class(button, "block", /*block*/ ctx[16]);
    			toggle_class(button, "svelte-pyxekj", true);
    			add_location(button, file, 328, 0, 12456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_blocks[current_block_type_index].m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[21], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(button, null);
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*type*/ 131072) && { type: /*type*/ ctx[17] },
    				{ class: "svelteit-button" },
    				dirty & /*$$props*/ 262144 && /*$$props*/ ctx[18]
    			]));

    			toggle_class(button, "primary", /*primary*/ ctx[1]);
    			toggle_class(button, "secondary", /*secondary*/ ctx[2]);
    			toggle_class(button, "success", /*success*/ ctx[3]);
    			toggle_class(button, "danger", /*danger*/ ctx[4]);
    			toggle_class(button, "warning", /*warning*/ ctx[5]);
    			toggle_class(button, "info", /*info*/ ctx[6]);
    			toggle_class(button, "light", /*light*/ ctx[7]);
    			toggle_class(button, "dark", /*dark*/ ctx[8]);
    			toggle_class(button, "outline", /*outline*/ ctx[10]);
    			toggle_class(button, "small", /*small*/ ctx[11]);
    			toggle_class(button, "medium", /*medium*/ ctx[12]);
    			toggle_class(button, "large", /*large*/ ctx[13]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[9]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[14]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[15]);
    			toggle_class(button, "block", /*block*/ ctx[16]);
    			toggle_class(button, "svelte-pyxekj", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { title = undefined } = $$props;
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { success = false } = $$props;
    	let { danger = false } = $$props;
    	let { warning = false } = $$props;
    	let { info = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { disabled = false } = $$props;
    	let { outline = false } = $$props;
    	let { small = false } = $$props;
    	let { medium = false } = $$props;
    	let { large = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { block = false } = $$props;
    	let { type = "button" } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("title" in $$new_props) $$invalidate(0, title = $$new_props.title);
    		if ("primary" in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ("secondary" in $$new_props) $$invalidate(2, secondary = $$new_props.secondary);
    		if ("success" in $$new_props) $$invalidate(3, success = $$new_props.success);
    		if ("danger" in $$new_props) $$invalidate(4, danger = $$new_props.danger);
    		if ("warning" in $$new_props) $$invalidate(5, warning = $$new_props.warning);
    		if ("info" in $$new_props) $$invalidate(6, info = $$new_props.info);
    		if ("light" in $$new_props) $$invalidate(7, light = $$new_props.light);
    		if ("dark" in $$new_props) $$invalidate(8, dark = $$new_props.dark);
    		if ("disabled" in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("outline" in $$new_props) $$invalidate(10, outline = $$new_props.outline);
    		if ("small" in $$new_props) $$invalidate(11, small = $$new_props.small);
    		if ("medium" in $$new_props) $$invalidate(12, medium = $$new_props.medium);
    		if ("large" in $$new_props) $$invalidate(13, large = $$new_props.large);
    		if ("outlined" in $$new_props) $$invalidate(14, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(15, rounded = $$new_props.rounded);
    		if ("block" in $$new_props) $$invalidate(16, block = $$new_props.block);
    		if ("type" in $$new_props) $$invalidate(17, type = $$new_props.type);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		disabled,
    		outline,
    		small,
    		medium,
    		large,
    		outlined,
    		rounded,
    		block,
    		type
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("title" in $$props) $$invalidate(0, title = $$new_props.title);
    		if ("primary" in $$props) $$invalidate(1, primary = $$new_props.primary);
    		if ("secondary" in $$props) $$invalidate(2, secondary = $$new_props.secondary);
    		if ("success" in $$props) $$invalidate(3, success = $$new_props.success);
    		if ("danger" in $$props) $$invalidate(4, danger = $$new_props.danger);
    		if ("warning" in $$props) $$invalidate(5, warning = $$new_props.warning);
    		if ("info" in $$props) $$invalidate(6, info = $$new_props.info);
    		if ("light" in $$props) $$invalidate(7, light = $$new_props.light);
    		if ("dark" in $$props) $$invalidate(8, dark = $$new_props.dark);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ("outline" in $$props) $$invalidate(10, outline = $$new_props.outline);
    		if ("small" in $$props) $$invalidate(11, small = $$new_props.small);
    		if ("medium" in $$props) $$invalidate(12, medium = $$new_props.medium);
    		if ("large" in $$props) $$invalidate(13, large = $$new_props.large);
    		if ("outlined" in $$props) $$invalidate(14, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(15, rounded = $$new_props.rounded);
    		if ("block" in $$props) $$invalidate(16, block = $$new_props.block);
    		if ("type" in $$props) $$invalidate(17, type = $$new_props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		title,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		disabled,
    		outline,
    		small,
    		medium,
    		large,
    		outlined,
    		rounded,
    		block,
    		type,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			title: 0,
    			primary: 1,
    			secondary: 2,
    			success: 3,
    			danger: 4,
    			warning: 5,
    			info: 6,
    			light: 7,
    			dark: 8,
    			disabled: 9,
    			outline: 10,
    			small: 11,
    			medium: 12,
    			large: 13,
    			outlined: 14,
    			rounded: 15,
    			block: 16,
    			type: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get title() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warning() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warning(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get medium() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set medium(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/Table.svelte generated by Svelte v3.24.0 */

    const file$1 = "node_modules/@colorfuldots/svelteit/src/Table.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let table;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			if (default_slot) default_slot.c();
    			attr_dev(table, "class", "svelte-8q1j4i");
    			toggle_class(table, "primary", /*primary*/ ctx[5]);
    			toggle_class(table, "secondary", /*secondary*/ ctx[6]);
    			toggle_class(table, "success", /*success*/ ctx[7]);
    			toggle_class(table, "danger", /*danger*/ ctx[8]);
    			toggle_class(table, "warning", /*warning*/ ctx[9]);
    			toggle_class(table, "info", /*info*/ ctx[10]);
    			toggle_class(table, "light", /*light*/ ctx[11]);
    			toggle_class(table, "dark", /*dark*/ ctx[12]);
    			toggle_class(table, "bordered", /*bordered*/ ctx[0]);
    			toggle_class(table, "borderless", /*borderless*/ ctx[2]);
    			toggle_class(table, "striped", /*striped*/ ctx[4]);
    			toggle_class(table, "rounded", /*rounded*/ ctx[1]);
    			toggle_class(table, "hoverable", /*hoverable*/ ctx[3]);
    			add_location(table, file$1, 93, 2, 2124);
    			attr_dev(div, "class", "svelteit-table svelte-8q1j4i");
    			toggle_class(div, "responsive", /*responsive*/ ctx[13]);
    			toggle_class(div, "nowrap", /*nowrap*/ ctx[14]);
    			add_location(div, file$1, 92, 0, 2062);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			if (dirty & /*primary*/ 32) {
    				toggle_class(table, "primary", /*primary*/ ctx[5]);
    			}

    			if (dirty & /*secondary*/ 64) {
    				toggle_class(table, "secondary", /*secondary*/ ctx[6]);
    			}

    			if (dirty & /*success*/ 128) {
    				toggle_class(table, "success", /*success*/ ctx[7]);
    			}

    			if (dirty & /*danger*/ 256) {
    				toggle_class(table, "danger", /*danger*/ ctx[8]);
    			}

    			if (dirty & /*warning*/ 512) {
    				toggle_class(table, "warning", /*warning*/ ctx[9]);
    			}

    			if (dirty & /*info*/ 1024) {
    				toggle_class(table, "info", /*info*/ ctx[10]);
    			}

    			if (dirty & /*light*/ 2048) {
    				toggle_class(table, "light", /*light*/ ctx[11]);
    			}

    			if (dirty & /*dark*/ 4096) {
    				toggle_class(table, "dark", /*dark*/ ctx[12]);
    			}

    			if (dirty & /*bordered*/ 1) {
    				toggle_class(table, "bordered", /*bordered*/ ctx[0]);
    			}

    			if (dirty & /*borderless*/ 4) {
    				toggle_class(table, "borderless", /*borderless*/ ctx[2]);
    			}

    			if (dirty & /*striped*/ 16) {
    				toggle_class(table, "striped", /*striped*/ ctx[4]);
    			}

    			if (dirty & /*rounded*/ 2) {
    				toggle_class(table, "rounded", /*rounded*/ ctx[1]);
    			}

    			if (dirty & /*hoverable*/ 8) {
    				toggle_class(table, "hoverable", /*hoverable*/ ctx[3]);
    			}

    			if (dirty & /*responsive*/ 8192) {
    				toggle_class(div, "responsive", /*responsive*/ ctx[13]);
    			}

    			if (dirty & /*nowrap*/ 16384) {
    				toggle_class(div, "nowrap", /*nowrap*/ ctx[14]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { bordered = false } = $$props;
    	let { rounded = false } = $$props;
    	let { borderless = false } = $$props;
    	let { hoverable = false } = $$props;
    	let { striped = false } = $$props;
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { success = false } = $$props;
    	let { danger = false } = $$props;
    	let { warning = false } = $$props;
    	let { info = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { responsive = false } = $$props;
    	let { nowrap = false } = $$props;

    	const writable_props = [
    		"bordered",
    		"rounded",
    		"borderless",
    		"hoverable",
    		"striped",
    		"primary",
    		"secondary",
    		"success",
    		"danger",
    		"warning",
    		"info",
    		"light",
    		"dark",
    		"responsive",
    		"nowrap"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Table", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("bordered" in $$props) $$invalidate(0, bordered = $$props.bordered);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("borderless" in $$props) $$invalidate(2, borderless = $$props.borderless);
    		if ("hoverable" in $$props) $$invalidate(3, hoverable = $$props.hoverable);
    		if ("striped" in $$props) $$invalidate(4, striped = $$props.striped);
    		if ("primary" in $$props) $$invalidate(5, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(6, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(7, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(8, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(9, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(10, info = $$props.info);
    		if ("light" in $$props) $$invalidate(11, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(12, dark = $$props.dark);
    		if ("responsive" in $$props) $$invalidate(13, responsive = $$props.responsive);
    		if ("nowrap" in $$props) $$invalidate(14, nowrap = $$props.nowrap);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		bordered,
    		rounded,
    		borderless,
    		hoverable,
    		striped,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		responsive,
    		nowrap
    	});

    	$$self.$inject_state = $$props => {
    		if ("bordered" in $$props) $$invalidate(0, bordered = $$props.bordered);
    		if ("rounded" in $$props) $$invalidate(1, rounded = $$props.rounded);
    		if ("borderless" in $$props) $$invalidate(2, borderless = $$props.borderless);
    		if ("hoverable" in $$props) $$invalidate(3, hoverable = $$props.hoverable);
    		if ("striped" in $$props) $$invalidate(4, striped = $$props.striped);
    		if ("primary" in $$props) $$invalidate(5, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(6, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(7, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(8, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(9, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(10, info = $$props.info);
    		if ("light" in $$props) $$invalidate(11, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(12, dark = $$props.dark);
    		if ("responsive" in $$props) $$invalidate(13, responsive = $$props.responsive);
    		if ("nowrap" in $$props) $$invalidate(14, nowrap = $$props.nowrap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bordered,
    		rounded,
    		borderless,
    		hoverable,
    		striped,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		responsive,
    		nowrap,
    		$$scope,
    		$$slots
    	];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			bordered: 0,
    			rounded: 1,
    			borderless: 2,
    			hoverable: 3,
    			striped: 4,
    			primary: 5,
    			secondary: 6,
    			success: 7,
    			danger: 8,
    			warning: 9,
    			info: 10,
    			light: 11,
    			dark: 12,
    			responsive: 13,
    			nowrap: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get bordered() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bordered(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderless() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderless(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverable() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverable(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warning() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warning(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get responsive() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set responsive(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nowrap() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nowrap(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/Accordions.svelte generated by Svelte v3.24.0 */

    const file$2 = "node_modules/@colorfuldots/svelteit/src/Accordions.svelte";

    // (2:8) Please add at least one Accordion
    function fallback_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please add at least one Accordion");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(2:8) Please add at least one Accordion",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	const default_slot_or_fallback = default_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(section, "class", "accordions collapsible");
    			add_location(section, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Accordions> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Accordions", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Accordions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordions",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/Accordion.svelte generated by Svelte v3.24.0 */
    const file$3 = "node_modules/@colorfuldots/svelteit/src/Accordion.svelte";
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    // (391:2) {#if control}
    function create_if_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*id*/ ctx[0] == /*openedAccordion*/ ctx[1]) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(391:2) {#if control}",
    		ctx
    	});

    	return block_1;
    }

    // (394:4) {:else}
    function create_else_block$1(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "+";
    			attr_dev(span, "class", "control svelte-2y507a");
    			add_location(span, file$3, 394, 6, 10519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(394:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (392:4) {#if id == openedAccordion}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "-";
    			attr_dev(span, "class", "control svelte-2y507a");
    			add_location(span, file$3, 392, 6, 10468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(392:4) {#if id == openedAccordion}",
    		ctx
    	});

    	return block_1;
    }

    // (401:0) {#if id == openedAccordion}
    function create_if_block$1(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelteit-accordion-body svelte-2y507a");
    			toggle_class(div, "primary", /*primary*/ ctx[2]);
    			toggle_class(div, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(div, "success", /*success*/ ctx[4]);
    			toggle_class(div, "danger", /*danger*/ ctx[5]);
    			toggle_class(div, "warning", /*warning*/ ctx[6]);
    			toggle_class(div, "info", /*info*/ ctx[7]);
    			toggle_class(div, "light", /*light*/ ctx[8]);
    			toggle_class(div, "dark", /*dark*/ ctx[9]);
    			toggle_class(div, "outline", /*outline*/ ctx[11]);
    			toggle_class(div, "small", /*small*/ ctx[12]);
    			toggle_class(div, "medium", /*medium*/ ctx[13]);
    			toggle_class(div, "large", /*large*/ ctx[14]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[10]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[15]);
    			toggle_class(div, "rounded", /*rounded*/ ctx[16]);
    			toggle_class(div, "block", /*block*/ ctx[17]);
    			add_location(div, file$3, 401, 2, 10637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}

    			if (dirty & /*primary*/ 4) {
    				toggle_class(div, "primary", /*primary*/ ctx[2]);
    			}

    			if (dirty & /*secondary*/ 8) {
    				toggle_class(div, "secondary", /*secondary*/ ctx[3]);
    			}

    			if (dirty & /*success*/ 16) {
    				toggle_class(div, "success", /*success*/ ctx[4]);
    			}

    			if (dirty & /*danger*/ 32) {
    				toggle_class(div, "danger", /*danger*/ ctx[5]);
    			}

    			if (dirty & /*warning*/ 64) {
    				toggle_class(div, "warning", /*warning*/ ctx[6]);
    			}

    			if (dirty & /*info*/ 128) {
    				toggle_class(div, "info", /*info*/ ctx[7]);
    			}

    			if (dirty & /*light*/ 256) {
    				toggle_class(div, "light", /*light*/ ctx[8]);
    			}

    			if (dirty & /*dark*/ 512) {
    				toggle_class(div, "dark", /*dark*/ ctx[9]);
    			}

    			if (dirty & /*outline*/ 2048) {
    				toggle_class(div, "outline", /*outline*/ ctx[11]);
    			}

    			if (dirty & /*small*/ 4096) {
    				toggle_class(div, "small", /*small*/ ctx[12]);
    			}

    			if (dirty & /*medium*/ 8192) {
    				toggle_class(div, "medium", /*medium*/ ctx[13]);
    			}

    			if (dirty & /*large*/ 16384) {
    				toggle_class(div, "large", /*large*/ ctx[14]);
    			}

    			if (dirty & /*disabled*/ 1024) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[10]);
    			}

    			if (dirty & /*outlined*/ 32768) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[15]);
    			}

    			if (dirty & /*rounded*/ 65536) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[16]);
    			}

    			if (dirty & /*block*/ 131072) {
    				toggle_class(div, "block", /*block*/ ctx[17]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div_transition) div_transition = create_bidirectional_transition(
    						div,
    						slide,
    						{
    							delay: 0,
    							duration: 350,
    							easing: quintOut
    						},
    						true
    					);

    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(
    					div,
    					slide,
    					{
    						delay: 0,
    						duration: 350,
    						easing: quintOut
    					},
    					false
    				);

    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(401:0) {#if id == openedAccordion}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*control*/ ctx[18] && create_if_block_1(ctx);
    	const title_slot_template = /*$$slots*/ ctx[21].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[20], get_title_slot_context);
    	let if_block1 = /*id*/ ctx[0] == /*openedAccordion*/ ctx[1] && create_if_block$1(ctx);

    	const block_1 = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (title_slot) title_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "svelteit-accordion-header svelte-2y507a");
    			toggle_class(div, "primary", /*primary*/ ctx[2]);
    			toggle_class(div, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(div, "success", /*success*/ ctx[4]);
    			toggle_class(div, "danger", /*danger*/ ctx[5]);
    			toggle_class(div, "warning", /*warning*/ ctx[6]);
    			toggle_class(div, "info", /*info*/ ctx[7]);
    			toggle_class(div, "light", /*light*/ ctx[8]);
    			toggle_class(div, "dark", /*dark*/ ctx[9]);
    			toggle_class(div, "outline", /*outline*/ ctx[11]);
    			toggle_class(div, "small", /*small*/ ctx[12]);
    			toggle_class(div, "medium", /*medium*/ ctx[13]);
    			toggle_class(div, "large", /*large*/ ctx[14]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[10]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[15]);
    			toggle_class(div, "rounded", /*rounded*/ ctx[16]);
    			toggle_class(div, "block", /*block*/ ctx[17]);
    			add_location(div, file$3, 371, 0, 10054);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*control*/ ctx[18]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (dirty & /*primary*/ 4) {
    				toggle_class(div, "primary", /*primary*/ ctx[2]);
    			}

    			if (dirty & /*secondary*/ 8) {
    				toggle_class(div, "secondary", /*secondary*/ ctx[3]);
    			}

    			if (dirty & /*success*/ 16) {
    				toggle_class(div, "success", /*success*/ ctx[4]);
    			}

    			if (dirty & /*danger*/ 32) {
    				toggle_class(div, "danger", /*danger*/ ctx[5]);
    			}

    			if (dirty & /*warning*/ 64) {
    				toggle_class(div, "warning", /*warning*/ ctx[6]);
    			}

    			if (dirty & /*info*/ 128) {
    				toggle_class(div, "info", /*info*/ ctx[7]);
    			}

    			if (dirty & /*light*/ 256) {
    				toggle_class(div, "light", /*light*/ ctx[8]);
    			}

    			if (dirty & /*dark*/ 512) {
    				toggle_class(div, "dark", /*dark*/ ctx[9]);
    			}

    			if (dirty & /*outline*/ 2048) {
    				toggle_class(div, "outline", /*outline*/ ctx[11]);
    			}

    			if (dirty & /*small*/ 4096) {
    				toggle_class(div, "small", /*small*/ ctx[12]);
    			}

    			if (dirty & /*medium*/ 8192) {
    				toggle_class(div, "medium", /*medium*/ ctx[13]);
    			}

    			if (dirty & /*large*/ 16384) {
    				toggle_class(div, "large", /*large*/ ctx[14]);
    			}

    			if (dirty & /*disabled*/ 1024) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[10]);
    			}

    			if (dirty & /*outlined*/ 32768) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[15]);
    			}

    			if (dirty & /*rounded*/ 65536) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[16]);
    			}

    			if (dirty & /*block*/ 131072) {
    				toggle_class(div, "block", /*block*/ ctx[17]);
    			}

    			if (/*id*/ ctx[0] == /*openedAccordion*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*id, openedAccordion*/ 3) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (title_slot) title_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { id = 0 } = $$props;
    	let { openedAccordion = 0 } = $$props;
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { success = false } = $$props;
    	let { danger = false } = $$props;
    	let { warning = false } = $$props;
    	let { info = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { disabled = false } = $$props;
    	let { outline = false } = $$props;
    	let { small = false } = $$props;
    	let { medium = false } = $$props;
    	let { large = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { block = false } = $$props;
    	let { control = false } = $$props;

    	const writable_props = [
    		"id",
    		"openedAccordion",
    		"primary",
    		"secondary",
    		"success",
    		"danger",
    		"warning",
    		"info",
    		"light",
    		"dark",
    		"disabled",
    		"outline",
    		"small",
    		"medium",
    		"large",
    		"outlined",
    		"rounded",
    		"block",
    		"control"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Accordion> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Accordion", $$slots, ['title','default']);
    	const click_handler = () => dispatch("accordionSelected", id);

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("openedAccordion" in $$props) $$invalidate(1, openedAccordion = $$props.openedAccordion);
    		if ("primary" in $$props) $$invalidate(2, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(3, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(4, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(5, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(6, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(7, info = $$props.info);
    		if ("light" in $$props) $$invalidate(8, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(9, dark = $$props.dark);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("outline" in $$props) $$invalidate(11, outline = $$props.outline);
    		if ("small" in $$props) $$invalidate(12, small = $$props.small);
    		if ("medium" in $$props) $$invalidate(13, medium = $$props.medium);
    		if ("large" in $$props) $$invalidate(14, large = $$props.large);
    		if ("outlined" in $$props) $$invalidate(15, outlined = $$props.outlined);
    		if ("rounded" in $$props) $$invalidate(16, rounded = $$props.rounded);
    		if ("block" in $$props) $$invalidate(17, block = $$props.block);
    		if ("control" in $$props) $$invalidate(18, control = $$props.control);
    		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		quintOut,
    		createEventDispatcher,
    		dispatch,
    		id,
    		openedAccordion,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		disabled,
    		outline,
    		small,
    		medium,
    		large,
    		outlined,
    		rounded,
    		block,
    		control
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("openedAccordion" in $$props) $$invalidate(1, openedAccordion = $$props.openedAccordion);
    		if ("primary" in $$props) $$invalidate(2, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(3, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(4, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(5, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(6, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(7, info = $$props.info);
    		if ("light" in $$props) $$invalidate(8, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(9, dark = $$props.dark);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$props.disabled);
    		if ("outline" in $$props) $$invalidate(11, outline = $$props.outline);
    		if ("small" in $$props) $$invalidate(12, small = $$props.small);
    		if ("medium" in $$props) $$invalidate(13, medium = $$props.medium);
    		if ("large" in $$props) $$invalidate(14, large = $$props.large);
    		if ("outlined" in $$props) $$invalidate(15, outlined = $$props.outlined);
    		if ("rounded" in $$props) $$invalidate(16, rounded = $$props.rounded);
    		if ("block" in $$props) $$invalidate(17, block = $$props.block);
    		if ("control" in $$props) $$invalidate(18, control = $$props.control);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		openedAccordion,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		disabled,
    		outline,
    		small,
    		medium,
    		large,
    		outlined,
    		rounded,
    		block,
    		control,
    		dispatch,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Accordion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			id: 0,
    			openedAccordion: 1,
    			primary: 2,
    			secondary: 3,
    			success: 4,
    			danger: 5,
    			warning: 6,
    			info: 7,
    			light: 8,
    			dark: 9,
    			disabled: 10,
    			outline: 11,
    			small: 12,
    			medium: 13,
    			large: 14,
    			outlined: 15,
    			rounded: 16,
    			block: 17,
    			control: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accordion",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get id() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openedAccordion() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openedAccordion(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warning() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warning(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get medium() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set medium(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get control() {
    		throw new Error("<Accordion>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set control(value) {
    		throw new Error("<Accordion>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/@colorfuldots/svelteit/src/Tabs.svelte generated by Svelte v3.24.0 */
    const file$4 = "node_modules/@colorfuldots/svelteit/src/Tabs.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tabs");
    			add_location(div, file$4, 51, 0, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$4($$self, $$props, $$invalidate) {
    	const tabs = [];
    	const panels = [];
    	const selectedTab = writable(null);
    	const selectedPanel = writable(null);

    	setContext(TABS, {
    		registerTab: tab => {
    			tabs.push(tab);
    			selectedTab.update(current => current || tab);

    			onDestroy(() => {
    				const i = tabs.indexOf(tab);
    				tabs.splice(i, 1);

    				selectedTab.update(current => current === tab
    				? tabs[i] || tabs[tabs.length - 1]
    				: current);
    			});
    		},
    		registerPanel: panel => {
    			panels.push(panel);
    			selectedPanel.update(current => current || panel);

    			onDestroy(() => {
    				const i = panels.indexOf(panel);
    				panels.splice(i, 1);

    				selectedPanel.update(current => current === panel
    				? panels[i] || panels[panels.length - 1]
    				: current);
    			});
    		},
    		selectTab: tab => {
    			const i = tabs.indexOf(tab);
    			selectedTab.set(tab);
    			selectedPanel.set(panels[i]);
    		},
    		selectedTab,
    		selectedPanel
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		setContext,
    		onDestroy,
    		writable,
    		tabs,
    		panels,
    		selectedTab,
    		selectedPanel
    	});

    	return [$$scope, $$slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/TabList.svelte generated by Svelte v3.24.0 */

    const file$5 = "node_modules/@colorfuldots/svelteit/src/TabList.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tab-list svelte-1r193i3");
    			add_location(div, file$5, 4, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TabList", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/TabPanel.svelte generated by Svelte v3.24.0 */
    const file$6 = "node_modules/@colorfuldots/svelteit/src/TabPanel.svelte";

    // (15:0) {#if $selectedPanel === panel}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tabs-panel svelte-v4allr");
    			add_location(div, file$6, 15, 2, 296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:0) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $selectedPanel;
    	const panel = {};
    	const { registerPanel, selectedPanel } = getContext(TABS);
    	validate_store(selectedPanel, "selectedPanel");
    	component_subscribe($$self, selectedPanel, value => $$invalidate(0, $selectedPanel = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TabPanel", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		$selectedPanel
    	});

    	return [$selectedPanel, panel, selectedPanel, $$scope, $$slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/Tab.svelte generated by Svelte v3.24.0 */
    const file$7 = "node_modules/@colorfuldots/svelteit/src/Tab.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "svelte-1ry1dnd");
    			toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			add_location(button, file$7, 26, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (dirty & /*$selectedTab, tab*/ 3) {
    				toggle_class(button, "selected", /*$selectedTab*/ ctx[0] === /*tab*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	const tab = {};
    	const { registerTab, selectTab, selectedTab } = getContext(TABS);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(0, $selectedTab = value));
    	registerTab(tab);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tab", $$slots, ['default']);
    	const click_handler = () => selectTab(tab);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		TABS,
    		tab,
    		registerTab,
    		selectTab,
    		selectedTab,
    		$selectedTab
    	});

    	return [$selectedTab, tab, selectTab, selectedTab, $$scope, $$slots, click_handler];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* node_modules/@colorfuldots/svelteit/src/Image.svelte generated by Svelte v3.24.0 */
    const file$8 = "node_modules/@colorfuldots/svelteit/src/Image.svelte";

    // (95:20) 
    function create_if_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*linkRoute*/ ctx[7]) return create_if_block_5;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(95:20) ",
    		ctx
    	});

    	return block;
    }

    // (93:17) 
    function create_if_block_3(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			attr_dev(img_1, "class", "img-circle svelte-3cmsrt");
    			attr_dev(img_1, "width", /*width*/ ctx[5]);
    			attr_dev(img_1, "height", /*height*/ ctx[4]);
    			add_location(img_1, file$8, 93, 2, 2213);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*img*/ 1 && img_1.src !== (img_1_src_value = /*img*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(img_1, "width", /*width*/ ctx[5]);
    			}

    			if (dirty & /*height*/ 16) {
    				attr_dev(img_1, "height", /*height*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(93:17) ",
    		ctx
    	});

    	return block;
    }

    // (64:0) {#if hero}
    function create_if_block$3(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let div1_style_value;
    	let current;
    	let if_block0 = /*description*/ ctx[2] && create_if_block_2$1(ctx);
    	let if_block1 = /*buttonRoute*/ ctx[6] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "svelte-3cmsrt");
    			add_location(h1, file$8, 69, 6, 1745);
    			attr_dev(div0, "class", "hero-text svelte-3cmsrt");
    			add_location(div0, file$8, 68, 4, 1715);
    			attr_dev(div1, "class", "hero-image svelte-3cmsrt");

    			attr_dev(div1, "style", div1_style_value = `height: ${/*height*/ ctx[4]}px;background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      url(${/*img*/ ctx[0]});`);

    			add_location(div1, file$8, 64, 2, 1554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (/*description*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*buttonRoute*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*buttonRoute*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*height, img*/ 17 && div1_style_value !== (div1_style_value = `height: ${/*height*/ ctx[4]}px;background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      url(${/*img*/ ctx[0]});`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(64:0) {#if hero}",
    		ctx
    	});

    	return block;
    }

    // (105:2) {:else}
    function create_else_block$2(ctx) {
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			attr_dev(img_1, "class", "img-thumbnail img-fluid svelte-3cmsrt");
    			attr_dev(img_1, "width", /*width*/ ctx[5]);
    			attr_dev(img_1, "height", /*height*/ ctx[4]);
    			add_location(img_1, file$8, 105, 4, 2491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*img*/ 1 && img_1.src !== (img_1_src_value = /*img*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(img_1, "width", /*width*/ ctx[5]);
    			}

    			if (dirty & /*height*/ 16) {
    				attr_dev(img_1, "height", /*height*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(105:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:2) {#if linkRoute}
    function create_if_block_5(ctx) {
    	let a;
    	let img_1;
    	let img_1_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img_1 = element("img");
    			if (img_1.src !== (img_1_src_value = /*img*/ ctx[0])) attr_dev(img_1, "src", img_1_src_value);
    			attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			attr_dev(img_1, "class", "img-thumbnail img-fluid svelte-3cmsrt");
    			attr_dev(img_1, "width", /*width*/ ctx[5]);
    			attr_dev(img_1, "height", /*height*/ ctx[4]);
    			add_location(img_1, file$8, 97, 6, 2349);
    			attr_dev(a, "href", /*linkRoute*/ ctx[7]);
    			add_location(a, file$8, 96, 4, 2322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*img*/ 1 && img_1.src !== (img_1_src_value = /*img*/ ctx[0])) {
    				attr_dev(img_1, "src", img_1_src_value);
    			}

    			if (dirty & /*title*/ 2) {
    				attr_dev(img_1, "alt", /*title*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 32) {
    				attr_dev(img_1, "width", /*width*/ ctx[5]);
    			}

    			if (dirty & /*height*/ 16) {
    				attr_dev(img_1, "height", /*height*/ ctx[4]);
    			}

    			if (dirty & /*linkRoute*/ 128) {
    				attr_dev(a, "href", /*linkRoute*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(96:2) {#if linkRoute}",
    		ctx
    	});

    	return block;
    }

    // (71:6) {#if description}
    function create_if_block_2$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*description*/ ctx[2]);
    			add_location(p, file$8, 71, 8, 1794);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 4) set_data_dev(t, /*description*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(71:6) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (74:6) {#if buttonRoute}
    function create_if_block_1$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				title: /*buttonTitle*/ ctx[3],
    				primary: /*primary*/ ctx[11],
    				secondary: /*secondary*/ ctx[12],
    				success: /*success*/ ctx[13],
    				warning: /*warning*/ ctx[15],
    				info: /*info*/ ctx[16],
    				danger: /*danger*/ ctx[14],
    				light: /*light*/ ctx[17],
    				dark: /*dark*/ ctx[18],
    				rounded: /*rounded*/ ctx[22],
    				small: /*small*/ ctx[19],
    				medium: /*medium*/ ctx[20],
    				large: /*large*/ ctx[21]
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*buttonRoute*/ ctx[6])) /*buttonRoute*/ ctx[6].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*buttonTitle*/ 8) button_changes.title = /*buttonTitle*/ ctx[3];
    			if (dirty & /*primary*/ 2048) button_changes.primary = /*primary*/ ctx[11];
    			if (dirty & /*secondary*/ 4096) button_changes.secondary = /*secondary*/ ctx[12];
    			if (dirty & /*success*/ 8192) button_changes.success = /*success*/ ctx[13];
    			if (dirty & /*warning*/ 32768) button_changes.warning = /*warning*/ ctx[15];
    			if (dirty & /*info*/ 65536) button_changes.info = /*info*/ ctx[16];
    			if (dirty & /*danger*/ 16384) button_changes.danger = /*danger*/ ctx[14];
    			if (dirty & /*light*/ 131072) button_changes.light = /*light*/ ctx[17];
    			if (dirty & /*dark*/ 262144) button_changes.dark = /*dark*/ ctx[18];
    			if (dirty & /*rounded*/ 4194304) button_changes.rounded = /*rounded*/ ctx[22];
    			if (dirty & /*small*/ 524288) button_changes.small = /*small*/ ctx[19];
    			if (dirty & /*medium*/ 1048576) button_changes.medium = /*medium*/ ctx[20];
    			if (dirty & /*large*/ 2097152) button_changes.large = /*large*/ ctx[21];
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(74:6) {#if buttonRoute}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*hero*/ ctx[8]) return 0;
    		if (/*avatar*/ ctx[10]) return 1;
    		if (/*thumbnail*/ ctx[9]) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { img = undefined } = $$props;
    	let { title = undefined } = $$props;
    	let { description = undefined } = $$props;
    	let { buttonTitle = undefined } = $$props;
    	let { height = undefined } = $$props;
    	let { width = undefined } = $$props;
    	let { buttonRoute = undefined } = $$props;
    	let { linkRoute = undefined } = $$props;
    	let { hero = false } = $$props;
    	let { thumbnail = false } = $$props;
    	let { avatar = false } = $$props;
    	let { primary = false } = $$props;
    	let { secondary = false } = $$props;
    	let { success = false } = $$props;
    	let { danger = false } = $$props;
    	let { warning = false } = $$props;
    	let { info = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { small = false } = $$props;
    	let { medium = false } = $$props;
    	let { large = false } = $$props;
    	let { rounded = false } = $$props;

    	const writable_props = [
    		"img",
    		"title",
    		"description",
    		"buttonTitle",
    		"height",
    		"width",
    		"buttonRoute",
    		"linkRoute",
    		"hero",
    		"thumbnail",
    		"avatar",
    		"primary",
    		"secondary",
    		"success",
    		"danger",
    		"warning",
    		"info",
    		"light",
    		"dark",
    		"small",
    		"medium",
    		"large",
    		"rounded"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Image", $$slots, []);

    	$$self.$set = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("buttonTitle" in $$props) $$invalidate(3, buttonTitle = $$props.buttonTitle);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("buttonRoute" in $$props) $$invalidate(6, buttonRoute = $$props.buttonRoute);
    		if ("linkRoute" in $$props) $$invalidate(7, linkRoute = $$props.linkRoute);
    		if ("hero" in $$props) $$invalidate(8, hero = $$props.hero);
    		if ("thumbnail" in $$props) $$invalidate(9, thumbnail = $$props.thumbnail);
    		if ("avatar" in $$props) $$invalidate(10, avatar = $$props.avatar);
    		if ("primary" in $$props) $$invalidate(11, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(12, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(13, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(14, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(15, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(16, info = $$props.info);
    		if ("light" in $$props) $$invalidate(17, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(18, dark = $$props.dark);
    		if ("small" in $$props) $$invalidate(19, small = $$props.small);
    		if ("medium" in $$props) $$invalidate(20, medium = $$props.medium);
    		if ("large" in $$props) $$invalidate(21, large = $$props.large);
    		if ("rounded" in $$props) $$invalidate(22, rounded = $$props.rounded);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		img,
    		title,
    		description,
    		buttonTitle,
    		height,
    		width,
    		buttonRoute,
    		linkRoute,
    		hero,
    		thumbnail,
    		avatar,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		small,
    		medium,
    		large,
    		rounded
    	});

    	$$self.$inject_state = $$props => {
    		if ("img" in $$props) $$invalidate(0, img = $$props.img);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("buttonTitle" in $$props) $$invalidate(3, buttonTitle = $$props.buttonTitle);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("buttonRoute" in $$props) $$invalidate(6, buttonRoute = $$props.buttonRoute);
    		if ("linkRoute" in $$props) $$invalidate(7, linkRoute = $$props.linkRoute);
    		if ("hero" in $$props) $$invalidate(8, hero = $$props.hero);
    		if ("thumbnail" in $$props) $$invalidate(9, thumbnail = $$props.thumbnail);
    		if ("avatar" in $$props) $$invalidate(10, avatar = $$props.avatar);
    		if ("primary" in $$props) $$invalidate(11, primary = $$props.primary);
    		if ("secondary" in $$props) $$invalidate(12, secondary = $$props.secondary);
    		if ("success" in $$props) $$invalidate(13, success = $$props.success);
    		if ("danger" in $$props) $$invalidate(14, danger = $$props.danger);
    		if ("warning" in $$props) $$invalidate(15, warning = $$props.warning);
    		if ("info" in $$props) $$invalidate(16, info = $$props.info);
    		if ("light" in $$props) $$invalidate(17, light = $$props.light);
    		if ("dark" in $$props) $$invalidate(18, dark = $$props.dark);
    		if ("small" in $$props) $$invalidate(19, small = $$props.small);
    		if ("medium" in $$props) $$invalidate(20, medium = $$props.medium);
    		if ("large" in $$props) $$invalidate(21, large = $$props.large);
    		if ("rounded" in $$props) $$invalidate(22, rounded = $$props.rounded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		img,
    		title,
    		description,
    		buttonTitle,
    		height,
    		width,
    		buttonRoute,
    		linkRoute,
    		hero,
    		thumbnail,
    		avatar,
    		primary,
    		secondary,
    		success,
    		danger,
    		warning,
    		info,
    		light,
    		dark,
    		small,
    		medium,
    		large,
    		rounded
    	];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			img: 0,
    			title: 1,
    			description: 2,
    			buttonTitle: 3,
    			height: 4,
    			width: 5,
    			buttonRoute: 6,
    			linkRoute: 7,
    			hero: 8,
    			thumbnail: 9,
    			avatar: 10,
    			primary: 11,
    			secondary: 12,
    			success: 13,
    			danger: 14,
    			warning: 15,
    			info: 16,
    			light: 17,
    			dark: 18,
    			small: 19,
    			medium: 20,
    			large: 21,
    			rounded: 22
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get img() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set img(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonTitle() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonTitle(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonRoute() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonRoute(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkRoute() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkRoute(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hero() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hero(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatar() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatar(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warning() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warning(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get medium() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set medium(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get large() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set large(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var cssVars = (e,t)=>{let r=new Set(Object.keys(t));return r.forEach(r=>{e.style.setProperty(`--${r}`,t[r]);}),{update(t){const o=new Set(Object.keys(t));o.forEach(o=>{e.style.setProperty(`--${o}`,t[o]),r.delete(o);}),r.forEach(t=>e.style.removeProperty(`--${t}`)),r=o;}}};

    /* node_modules/@colorfuldots/svelteit/src/Switch.svelte generated by Svelte v3.24.0 */
    const file$9 = "node_modules/@colorfuldots/svelteit/src/Switch.svelte";

    function create_fragment$9(ctx) {
    	let label;
    	let input;
    	let t;
    	let span;
    	let cssVars_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			input.disabled = /*disabled*/ ctx[1];
    			attr_dev(input, "class", "svelte-qvd8q8");
    			add_location(input, file$9, 62, 2, 1262);
    			attr_dev(span, "class", "svelteit-slider svelte-qvd8q8");
    			add_location(span, file$9, 63, 2, 1314);
    			attr_dev(label, "class", "svelteit-switch svelte-qvd8q8");
    			add_location(label, file$9, 61, 0, 1204);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[5]),
    					action_destroyer(cssVars_action = cssVars.call(null, label, /*styleVars*/ ctx[2]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (cssVars_action && is_function(cssVars_action.update) && dirty & /*styleVars*/ 4) cssVars_action.update.call(null, /*styleVars*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { checked = false } = $$props;
    	let { disabled = false } = $$props;
    	let { checkedColor = "green" } = $$props;
    	let { unCheckedColor = "red" } = $$props;
    	const writable_props = ["checked", "disabled", "checkedColor", "unCheckedColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Switch", $$slots, []);

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("checkedColor" in $$props) $$invalidate(3, checkedColor = $$props.checkedColor);
    		if ("unCheckedColor" in $$props) $$invalidate(4, unCheckedColor = $$props.unCheckedColor);
    	};

    	$$self.$capture_state = () => ({
    		cssVars,
    		checked,
    		disabled,
    		checkedColor,
    		unCheckedColor,
    		styleVars
    	});

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("checkedColor" in $$props) $$invalidate(3, checkedColor = $$props.checkedColor);
    		if ("unCheckedColor" in $$props) $$invalidate(4, unCheckedColor = $$props.unCheckedColor);
    		if ("styleVars" in $$props) $$invalidate(2, styleVars = $$props.styleVars);
    	};

    	let styleVars;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*checkedColor, unCheckedColor*/ 24) {
    			 $$invalidate(2, styleVars = { checkedColor, unCheckedColor });
    		}
    	};

    	return [
    		checked,
    		disabled,
    		styleVars,
    		checkedColor,
    		unCheckedColor,
    		input_change_handler
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			checked: 0,
    			disabled: 1,
    			checkedColor: 3,
    			unCheckedColor: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checkedColor() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checkedColor(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unCheckedColor() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unCheckedColor(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/BearingTable.svelte generated by Svelte v3.24.0 */
    const file$a = "src/BearingTable.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (60:2) {#each cols as col}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*col*/ ctx[12] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "svelte-12qk03y");
    			add_location(th, file$a, 60, 2, 1199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(60:2) {#each cols as col}",
    		ctx
    	});

    	return block;
    }

    // (67:2) {#each row as col, colIndex}
    function create_each_block_1(ctx) {
    	let td;
    	let p;
    	let raw_value = /*getBearingColors*/ ctx[4](/*col*/ ctx[12]) + "";

    	const block = {
    		c: function create() {
    			td = element("td");
    			p = element("p");
    			add_location(p, file$a, 68, 3, 1419);
    			attr_dev(td, "class", "svelte-12qk03y");
    			toggle_class(td, "currentSize", /*isCurrentSize*/ ctx[5](/*bearingValue*/ ctx[0], /*colIndex*/ ctx[14], /*rowIndex*/ ctx[11]));
    			add_location(td, file$a, 67, 2, 1342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, p);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isCurrentSize, bearingValue*/ 33) {
    				toggle_class(td, "currentSize", /*isCurrentSize*/ ctx[5](/*bearingValue*/ ctx[0], /*colIndex*/ ctx[14], /*rowIndex*/ ctx[11]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(67:2) {#each row as col, colIndex}",
    		ctx
    	});

    	return block;
    }

    // (64:1) {#each bearingMap as row, rowIndex}
    function create_each_block(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*rows*/ ctx[1][/*rowIndex*/ ctx[11]] + "";
    	let t0;
    	let t1;
    	let t2;
    	let each_value_1 = /*row*/ ctx[9];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(th, "class", "svelte-12qk03y");
    			add_location(th, file$a, 65, 2, 1281);
    			add_location(tr, file$a, 64, 1, 1273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isCurrentSize, bearingValue, getBearingColors, bearingMap*/ 57) {
    				each_value_1 = /*row*/ ctx[9];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(64:1) {#each bearingMap as row, rowIndex}",
    		ctx
    	});

    	return block;
    }

    // (57:0) <Table bordered>
    function create_default_slot(ctx) {
    	let tr;
    	let th;
    	let t0;
    	let t1;
    	let each1_anchor;
    	let each_value_2 = /*cols*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*bearingMap*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			attr_dev(th, "class", "svelte-12qk03y");
    			add_location(th, file$a, 58, 2, 1163);
    			add_location(tr, file$a, 57, 1, 1155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(tr, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cols*/ 4) {
    				each_value_2 = /*cols*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*bearingMap, isCurrentSize, bearingValue, getBearingColors, rows*/ 59) {
    				each_value = /*bearingMap*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(57:0) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let table;
    	let current;

    	table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table_changes = {};

    			if (dirty & /*$$scope, bearingValue*/ 131073) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function parseInput(arr, input) {
    	if (arr.includes("A")) {
    		return arr.indexOf(input.replace(/[0-9]/g, "").toUpperCase());
    	} else if (arr.includes("1")) {
    		return arr.indexOf(input.replace(/[^0-9]/g, ""));
    	}

    	return;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { data } = $$props;
    	let { bearingInput = "" } = $$props;
    	let rows = data.rows;
    	let cols = data.cols;
    	let bearings = data.bearings;
    	let bearingMap = data.bearingMap;

    	function getBearingColors(cellColors) {
    		var [color1, color2] = cellColors;
    		return bearings[color1] + "<br />" + bearings[color2];
    	}

    	function isCurrentSize(input, colIndex, rowIndex) {
    		let cellCol = parseInput(cols, input);
    		let cellRow = parseInput(rows, input);

    		if (cellCol < 0 || cellRow < 0) {
    			return false;
    		}

    		return cellCol == colIndex && cellRow == rowIndex;
    	}

    	const writable_props = ["data", "bearingInput"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BearingTable> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BearingTable", $$slots, []);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(6, data = $$props.data);
    		if ("bearingInput" in $$props) $$invalidate(7, bearingInput = $$props.bearingInput);
    	};

    	$$self.$capture_state = () => ({
    		Table,
    		data,
    		bearingInput,
    		rows,
    		cols,
    		bearings,
    		bearingMap,
    		getBearingColors,
    		isCurrentSize,
    		parseInput,
    		bearingValue
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(6, data = $$props.data);
    		if ("bearingInput" in $$props) $$invalidate(7, bearingInput = $$props.bearingInput);
    		if ("rows" in $$props) $$invalidate(1, rows = $$props.rows);
    		if ("cols" in $$props) $$invalidate(2, cols = $$props.cols);
    		if ("bearings" in $$props) bearings = $$props.bearings;
    		if ("bearingMap" in $$props) $$invalidate(3, bearingMap = $$props.bearingMap);
    		if ("bearingValue" in $$props) $$invalidate(0, bearingValue = $$props.bearingValue);
    	};

    	let bearingValue;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*bearingInput*/ 128) {
    			 $$invalidate(0, bearingValue = bearingInput);
    		}
    	};

    	return [
    		bearingValue,
    		rows,
    		cols,
    		bearingMap,
    		getBearingColors,
    		isCurrentSize,
    		data,
    		bearingInput
    	];
    }

    class BearingTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { data: 6, bearingInput: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BearingTable",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[6] === undefined && !("data" in props)) {
    			console.warn("<BearingTable> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<BearingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BearingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bearingInput() {
    		throw new Error("<BearingTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bearingInput(value) {
    		throw new Error("<BearingTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/BearingForm.svelte generated by Svelte v3.24.0 */
    const file$b = "src/BearingForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (43:16) {#each Array(data.numBearings) as _, index}
    function create_each_block_5(ctx) {
    	let th;
    	let t0;
    	let t1_value = /*index*/ ctx[10] + 1 + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[3](/*index*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text("#");
    			t1 = text(t1_value);
    			attr_dev(th, "class", "svelte-icpzn5");
    			toggle_class(th, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			add_location(th, file$b, 43, 16, 927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);

    			if (!mounted) {
    				dispose = listen_dev(th, "mouseover", mouseover_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*selectedJournal*/ 4) {
    				toggle_class(th, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(43:16) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (55:24) {#each data.cols as col}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*col*/ ctx[16] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*col*/ ctx[16];
    			option.value = option.__value;
    			add_location(option, file$b, 55, 28, 1576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && t_value !== (t_value = /*col*/ ctx[16] + "")) set_data_dev(t, t_value);

    			if (dirty & /*data*/ 2 && option_value_value !== (option_value_value = /*col*/ ctx[16])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(55:24) {#each data.cols as col}",
    		ctx
    	});

    	return block;
    }

    // (51:16) {#each Array(data.numBearings) as _, index}
    function create_each_block_3(ctx) {
    	let td;
    	let select;
    	let option;
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*data*/ ctx[1].cols;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[4].call(select, /*index*/ ctx[10]);
    	}

    	function mouseover_handler_1(...args) {
    		return /*mouseover_handler_1*/ ctx[5](/*index*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			option.__value = "";
    			option.value = option.__value;
    			option.selected = true;
    			option.disabled = true;
    			option.hidden = true;
    			add_location(option, file$b, 53, 24, 1446);
    			if (/*results*/ ctx[0].crankrodcode[/*index*/ ctx[10]] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$b, 52, 20, 1372);
    			attr_dev(td, "class", "svelte-icpzn5");
    			toggle_class(td, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			add_location(td, file$b, 51, 16, 1253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*results*/ ctx[0].crankrodcode[/*index*/ ctx[10]]);
    			append_dev(td, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(td, "mouseover", mouseover_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 2) {
    				each_value_4 = /*data*/ ctx[1].cols;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty & /*results, data*/ 3) {
    				select_option(select, /*results*/ ctx[0].crankrodcode[/*index*/ ctx[10]]);
    			}

    			if (dirty & /*selectedJournal*/ 4) {
    				toggle_class(td, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(51:16) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (68:24) {#each data.rows as row}
    function create_each_block_2$1(ctx) {
    	let option;
    	let t_value = /*row*/ ctx[12] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*row*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file$b, 68, 28, 2193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2 && t_value !== (t_value = /*row*/ ctx[12] + "")) set_data_dev(t, t_value);

    			if (dirty & /*data*/ 2 && option_value_value !== (option_value_value = /*row*/ ctx[12])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(68:24) {#each data.rows as row}",
    		ctx
    	});

    	return block;
    }

    // (64:16) {#each Array(data.numBearings) as _, index}
    function create_each_block_1$1(ctx) {
    	let td;
    	let select;
    	let option;
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*data*/ ctx[1].rows;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	function select_change_handler_1() {
    		/*select_change_handler_1*/ ctx[6].call(select, /*index*/ ctx[10]);
    	}

    	function mouseover_handler_2(...args) {
    		return /*mouseover_handler_2*/ ctx[7](/*index*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			select = element("select");
    			option = element("option");
    			option.textContent = "-";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			option.__value = "";
    			option.value = option.__value;
    			option.selected = true;
    			option.disabled = true;
    			option.hidden = true;
    			add_location(option, file$b, 66, 24, 2063);
    			if (/*results*/ ctx[0].journalcode[/*index*/ ctx[10]] === void 0) add_render_callback(select_change_handler_1);
    			add_location(select, file$b, 65, 20, 1990);
    			attr_dev(td, "class", "svelte-icpzn5");
    			toggle_class(td, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			add_location(td, file$b, 64, 16, 1871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*results*/ ctx[0].journalcode[/*index*/ ctx[10]]);
    			append_dev(td, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler_1),
    					listen_dev(td, "mouseover", mouseover_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 2) {
    				each_value_2 = /*data*/ ctx[1].rows;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*results, data*/ 3) {
    				select_option(select, /*results*/ ctx[0].journalcode[/*index*/ ctx[10]]);
    			}

    			if (dirty & /*selectedJournal*/ 4) {
    				toggle_class(td, "selected-column", /*index*/ ctx[10] == /*selectedJournal*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(64:16) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (77:20) {#each Array(data.numBearings) as _, index}
    function create_each_block$1(ctx) {
    	let span;
    	let h4;
    	let t0;
    	let t1_value = /*index*/ ctx[10] + 1 + "";
    	let t1;
    	let t2;
    	let bearingtable;
    	let t3;
    	let current;

    	bearingtable = new BearingTable({
    			props: {
    				data: /*data*/ ctx[1],
    				bearingInput: getBearingCodeFromInput(/*data*/ ctx[1], /*index*/ ctx[10])
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			h4 = element("h4");
    			t0 = text("Bearing Identification Chart for Journal #");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(bearingtable.$$.fragment);
    			t3 = space();
    			attr_dev(h4, "id", "bearing-chart-title");
    			attr_dev(h4, "class", "svelte-icpzn5");
    			add_location(h4, file$b, 78, 24, 2604);
    			attr_dev(span, "class", "svelte-icpzn5");
    			toggle_class(span, "hidden", /*selectedJournal*/ ctx[2] != /*index*/ ctx[10]);
    			add_location(span, file$b, 77, 20, 2533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h4);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(span, t2);
    			mount_component(bearingtable, span, null);
    			append_dev(span, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bearingtable_changes = {};
    			if (dirty & /*data*/ 2) bearingtable_changes.data = /*data*/ ctx[1];
    			if (dirty & /*data*/ 2) bearingtable_changes.bearingInput = getBearingCodeFromInput(/*data*/ ctx[1], /*index*/ ctx[10]);
    			bearingtable.$set(bearingtable_changes);

    			if (dirty & /*selectedJournal*/ 4) {
    				toggle_class(span, "hidden", /*selectedJournal*/ ctx[2] != /*index*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bearingtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bearingtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(bearingtable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(77:20) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (39:4) <Table bordered>
    function create_default_slot$1(ctx) {
    	let thead;
    	let tr0;
    	let th;
    	let t1;
    	let t2;
    	let tbody;
    	let tr1;
    	let td0;
    	let t3_value = /*data*/ ctx[1].colName + "";
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let tr2;
    	let td1;
    	let t7_value = /*data*/ ctx[1].rowName + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let tr3;
    	let td2;
    	let td2_colspan_value;
    	let current;
    	let each_value_5 = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value_5);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_3[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_3 = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th = element("th");
    			th.textContent = "Journal No.";
    			t1 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t2 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			t3 = text(t3_value);
    			t4 = text(":");
    			t5 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t6 = space();
    			tr2 = element("tr");
    			td1 = element("td");
    			t7 = text(t7_value);
    			t8 = text(":");
    			t9 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			tr3 = element("tr");
    			td2 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th, "class", "svelte-icpzn5");
    			add_location(th, file$b, 41, 16, 830);
    			attr_dev(tr0, "class", "svelte-icpzn5");
    			add_location(tr0, file$b, 40, 12, 809);
    			attr_dev(thead, "class", "svelte-icpzn5");
    			add_location(thead, file$b, 39, 8, 789);
    			add_location(td0, file$b, 49, 16, 1152);
    			add_location(tr1, file$b, 48, 12, 1130);
    			add_location(td1, file$b, 62, 16, 1770);
    			add_location(tr2, file$b, 61, 12, 1749);
    			attr_dev(td2, "colspan", td2_colspan_value = /*data*/ ctx[1].numBearings + 1);
    			attr_dev(td2, "class", "selected-column svelte-icpzn5");
    			add_location(td2, file$b, 75, 16, 2387);
    			add_location(tr3, file$b, 74, 12, 2366);
    			add_location(tbody, file$b, 47, 8, 1110);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th);
    			append_dev(tr0, t1);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(tr0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(td0, t3);
    			append_dev(td0, t4);
    			append_dev(tr1, t5);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(tr1, null);
    			}

    			append_dev(tbody, t6);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td1);
    			append_dev(td1, t7);
    			append_dev(td1, t8);
    			append_dev(tr2, t9);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr2, null);
    			}

    			append_dev(tbody, t10);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedJournal, data*/ 6) {
    				each_value_5 = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_5(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(tr0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_5.length;
    			}

    			if ((!current || dirty & /*data*/ 2) && t3_value !== (t3_value = /*data*/ ctx[1].colName + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*selectedJournal, results, data*/ 7) {
    				each_value_3 = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(tr1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if ((!current || dirty & /*data*/ 2) && t7_value !== (t7_value = /*data*/ ctx[1].rowName + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*selectedJournal, results, data*/ 7) {
    				each_value_1 = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedJournal, data, getBearingCodeFromInput*/ 6) {
    				each_value = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(td2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*data*/ 2 && td2_colspan_value !== (td2_colspan_value = /*data*/ ctx[1].numBearings + 1)) {
    				attr_dev(td2, "colspan", td2_colspan_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			destroy_each(each_blocks_3, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(39:4) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let form;
    	let table;
    	let current;

    	table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			form = element("form");
    			create_component(table.$$.fragment);
    			add_location(form, file$b, 37, 0, 753);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			mount_component(table, form, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table_changes = {};

    			if (dirty & /*$$scope, data, selectedJournal, results*/ 1048583) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getBearingCodeFromInput(bearingData, bearingNum) {
    	if (bearingNum >= bearingData.numBearings) {
    		return;
    	}

    	return bearingData.formInput.crankrodcode[bearingNum] + "" + bearingData.formInput.journalcode[bearingNum];
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { data } = $$props;
    	let { results = data.formInput } = $$props;
    	const writable_props = ["data", "results"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BearingForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BearingForm", $$slots, []);
    	const mouseover_handler = index => $$invalidate(2, selectedJournal = index);

    	function select_change_handler(index) {
    		results.crankrodcode[index] = select_value(this);
    		$$invalidate(0, results);
    		$$invalidate(1, data);
    	}

    	const mouseover_handler_1 = index => $$invalidate(2, selectedJournal = index);

    	function select_change_handler_1(index) {
    		results.journalcode[index] = select_value(this);
    		$$invalidate(0, results);
    		$$invalidate(1, data);
    	}

    	const mouseover_handler_2 = index => $$invalidate(2, selectedJournal = index);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("results" in $$props) $$invalidate(0, results = $$props.results);
    	};

    	$$self.$capture_state = () => ({
    		Table,
    		BearingTable,
    		data,
    		results,
    		getBearingCodeFromInput,
    		selectedJournal
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("results" in $$props) $$invalidate(0, results = $$props.results);
    		if ("selectedJournal" in $$props) $$invalidate(2, selectedJournal = $$props.selectedJournal);
    	};

    	let selectedJournal;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(2, selectedJournal = 0);

    	return [
    		results,
    		data,
    		selectedJournal,
    		mouseover_handler,
    		select_change_handler,
    		mouseover_handler_1,
    		select_change_handler_1,
    		mouseover_handler_2
    	];
    }

    class BearingForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { data: 1, results: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BearingForm",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !("data" in props)) {
    			console.warn("<BearingForm> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<BearingForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BearingForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get results() {
    		throw new Error("<BearingForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set results(value) {
    		throw new Error("<BearingForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/BearingCalculator.svelte generated by Svelte v3.24.0 */
    const file$c = "src/BearingCalculator.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (68:12) {#each Array(data.numBearings) as _, index}
    function create_each_block_1$2(ctx) {
    	let th;
    	let t0;
    	let t1_value = /*index*/ ctx[9] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text("#");
    			t1 = text(t1_value);
    			attr_dev(th, "class", "svelte-se6n1t");
    			add_location(th, file$c, 68, 16, 1505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(68:12) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (76:12) {#each Array(data.numBearings) as _, index}
    function create_each_block$2(ctx) {
    	let td;
    	let raw_value = /*calculateCurrentColors*/ ctx[3](/*index*/ ctx[9], /*formInput*/ ctx[2]) + "";

    	const block = {
    		c: function create() {
    			td = element("td");
    			add_location(td, file$c, 76, 16, 1708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			td.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formInput*/ 4 && raw_value !== (raw_value = /*calculateCurrentColors*/ ctx[3](/*index*/ ctx[9], /*formInput*/ ctx[2]) + "")) td.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(76:12) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Table bordered>
    function create_default_slot_1(ctx) {
    	let thead;
    	let tr0;
    	let th;
    	let t1;
    	let t2;
    	let tbody;
    	let tr1;
    	let td;
    	let t4;
    	let each_value_1 = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*data*/ ctx[1].numBearings);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th = element("th");
    			th.textContent = "Journal No.";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td = element("td");
    			td.textContent = "Bearing Colors:";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th, "class", "svelte-se6n1t");
    			add_location(th, file$c, 66, 12, 1412);
    			attr_dev(tr0, "class", "svelte-se6n1t");
    			add_location(tr0, file$c, 65, 8, 1395);
    			attr_dev(thead, "class", "svelte-se6n1t");
    			add_location(thead, file$c, 64, 4, 1379);
    			add_location(td, file$c, 74, 12, 1611);
    			add_location(tr1, file$c, 73, 8, 1594);
    			add_location(tbody, file$c, 72, 4, 1578);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th);
    			append_dev(tr0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td);
    			append_dev(tr1, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 2) {
    				each_value_1 = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*calculateCurrentColors, formInput, data*/ 14) {
    				each_value = Array(/*data*/ ctx[1].numBearings);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(64:0) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    // (101:8) <Table id="full-step-table">
    function create_default_slot$2(ctx) {
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let tbody;
    	let tr1;
    	let th3;
    	let t7;
    	let td0;
    	let t8;
    	let br0;
    	let t9;
    	let t10;
    	let td1;
    	let t11;
    	let br1;
    	let t12;
    	let t13;
    	let tr2;
    	let th4;
    	let t15;
    	let td2;
    	let t16;
    	let br2;
    	let t17;
    	let t18;
    	let td3;
    	let t19;
    	let br3;
    	let t20;

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Calculation Type";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Original Bearings";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "New Bearings";
    			t5 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Half-Step (Default)";
    			t7 = space();
    			td0 = element("td");
    			t8 = text("Yellow");
    			br0 = element("br");
    			t9 = text("Yellow");
    			t10 = space();
    			td1 = element("td");
    			t11 = text("Yellow");
    			br1 = element("br");
    			t12 = text("Green");
    			t13 = space();
    			tr2 = element("tr");
    			th4 = element("th");
    			th4.textContent = "Full-Step";
    			t15 = space();
    			td2 = element("td");
    			t16 = text("Yellow");
    			br2 = element("br");
    			t17 = text("Yellow");
    			t18 = space();
    			td3 = element("td");
    			t19 = text("Green");
    			br3 = element("br");
    			t20 = text("Green");
    			attr_dev(th0, "class", "full-step-table-header svelte-se6n1t");
    			add_location(th0, file$c, 103, 20, 2783);
    			attr_dev(th1, "class", "svelte-se6n1t");
    			add_location(th1, file$c, 104, 20, 2860);
    			attr_dev(th2, "class", "svelte-se6n1t");
    			add_location(th2, file$c, 105, 20, 2907);
    			attr_dev(tr0, "class", "svelte-se6n1t");
    			add_location(tr0, file$c, 102, 16, 2758);
    			attr_dev(thead, "class", "svelte-se6n1t");
    			add_location(thead, file$c, 101, 12, 2734);
    			add_location(th3, file$c, 110, 20, 3034);
    			add_location(br0, file$c, 111, 30, 3093);
    			add_location(td0, file$c, 111, 20, 3083);
    			add_location(br1, file$c, 112, 30, 3141);
    			add_location(td1, file$c, 112, 20, 3131);
    			add_location(tr1, file$c, 109, 16, 3009);
    			add_location(th4, file$c, 115, 20, 3221);
    			add_location(br2, file$c, 116, 30, 3270);
    			add_location(td2, file$c, 116, 20, 3260);
    			add_location(br3, file$c, 117, 29, 3317);
    			add_location(td3, file$c, 117, 20, 3308);
    			add_location(tr2, file$c, 114, 16, 3196);
    			add_location(tbody, file$c, 108, 12, 2985);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th3);
    			append_dev(tr1, t7);
    			append_dev(tr1, td0);
    			append_dev(td0, t8);
    			append_dev(td0, br0);
    			append_dev(td0, t9);
    			append_dev(tr1, t10);
    			append_dev(tr1, td1);
    			append_dev(td1, t11);
    			append_dev(td1, br1);
    			append_dev(td1, t12);
    			append_dev(tbody, t13);
    			append_dev(tbody, tr2);
    			append_dev(tr2, th4);
    			append_dev(tr2, t15);
    			append_dev(tr2, td2);
    			append_dev(td2, t16);
    			append_dev(td2, br2);
    			append_dev(td2, t17);
    			append_dev(tr2, t18);
    			append_dev(tr2, td3);
    			append_dev(td3, t19);
    			append_dev(td3, br3);
    			append_dev(td3, t20);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(tbody);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(101:8) <Table id=\\\"full-step-table\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let table0;
    	let t0;
    	let br;
    	let t1;
    	let div1;
    	let h4;
    	let t3;
    	let span;
    	let label;
    	let t5;
    	let switch_1;
    	let updating_checked;
    	let t6;
    	let div0;
    	let p0;
    	let t8;
    	let p1;
    	let t10;
    	let table1;
    	let current;

    	table0 = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[4].call(null, value);
    	}

    	let switch_1_props = {
    		id: "half-step-switch",
    		unCheckedColor: "gray",
    		checkedColor: "purple"
    	};

    	if (/*calcFullStep*/ ctx[0] !== void 0) {
    		switch_1_props.checked = /*calcFullStep*/ ctx[0];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "checked", switch_1_checked_binding));

    	table1 = new Table({
    			props: {
    				id: "full-step-table",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table0.$$.fragment);
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Options:";
    			t3 = space();
    			span = element("span");
    			label = element("label");
    			label.textContent = "Perform Full Step Calculation:";
    			t5 = space();
    			create_component(switch_1.$$.fragment);
    			t6 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "A 'Full Step' calculation will calculate the next available bearings for both the top and bottom bearings. \n            This may be required if the crankshaft has some damage and needs to be polished/ground down further than what is normally required. \n            If the crank has been professionally micro-polished, a 'Half Step' calculation will usually suffice.";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "If you aren't sure which calculation to use, please contact a professional advisor/engine builder for more information.";
    			t10 = space();
    			create_component(table1.$$.fragment);
    			add_location(br, file$c, 82, 0, 1823);
    			add_location(h4, file$c, 85, 4, 1859);
    			attr_dev(label, "for", "half-step-switch");
    			attr_dev(label, "class", "svelte-se6n1t");
    			add_location(label, file$c, 87, 8, 1896);
    			attr_dev(span, "class", "svelte-se6n1t");
    			add_location(span, file$c, 86, 4, 1881);
    			attr_dev(p0, "class", "svelte-se6n1t");
    			add_location(p0, file$c, 91, 8, 2132);
    			attr_dev(p1, "class", "svelte-se6n1t");
    			add_location(p1, file$c, 96, 8, 2535);
    			attr_dev(div0, "id", "full-step-help");
    			attr_dev(div0, "class", "svelte-se6n1t");
    			add_location(div0, file$c, 90, 4, 2098);
    			attr_dev(div1, "id", "options-menu");
    			attr_dev(div1, "class", "svelte-se6n1t");
    			add_location(div1, file$c, 84, 0, 1831);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(table0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(div1, t3);
    			append_dev(div1, span);
    			append_dev(span, label);
    			append_dev(span, t5);
    			mount_component(switch_1, span, null);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(div0, t10);
    			mount_component(table1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table0_changes = {};

    			if (dirty & /*$$scope, data, formInput*/ 2054) {
    				table0_changes.$$scope = { dirty, ctx };
    			}

    			table0.$set(table0_changes);
    			const switch_1_changes = {};

    			if (!updating_checked && dirty & /*calcFullStep*/ 1) {
    				updating_checked = true;
    				switch_1_changes.checked = /*calcFullStep*/ ctx[0];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);
    			const table1_changes = {};

    			if (dirty & /*$$scope*/ 2048) {
    				table1_changes.$$scope = { dirty, ctx };
    			}

    			table1.$set(table1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table0.$$.fragment, local);
    			transition_in(switch_1.$$.fragment, local);
    			transition_in(table1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table0.$$.fragment, local);
    			transition_out(switch_1.$$.fragment, local);
    			transition_out(table1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(switch_1);
    			destroy_component(table1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { data } = $$props;
    	let { calcFullStep = false } = $$props;
    	let bearings = data.bearings;
    	let bearingMap = data.bearingMap;

    	function calculateCurrentColors(index, formData) {
    		let crankcode = formData.crankrodcode[index];
    		let journalcode = formData.journalcode[index];
    		let colIndex = data.cols.indexOf(crankcode);
    		let rowIndex = data.rows.indexOf(journalcode);

    		if (colIndex < 0 || rowIndex < 0) {
    			return "-";
    		}

    		let cellIndex = bearingMap[rowIndex][colIndex];
    		return bearings[cellIndex[0]] + "<br />" + bearings[cellIndex[1]];
    	}

    	const writable_props = ["data", "calcFullStep"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BearingCalculator> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BearingCalculator", $$slots, []);

    	function switch_1_checked_binding(value) {
    		calcFullStep = value;
    		$$invalidate(0, calcFullStep);
    	}

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("calcFullStep" in $$props) $$invalidate(0, calcFullStep = $$props.calcFullStep);
    	};

    	$$self.$capture_state = () => ({
    		Table,
    		Switch,
    		data,
    		calcFullStep,
    		bearings,
    		bearingMap,
    		calculateCurrentColors,
    		formInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("calcFullStep" in $$props) $$invalidate(0, calcFullStep = $$props.calcFullStep);
    		if ("bearings" in $$props) bearings = $$props.bearings;
    		if ("bearingMap" in $$props) bearingMap = $$props.bearingMap;
    		if ("formInput" in $$props) $$invalidate(2, formInput = $$props.formInput);
    	};

    	let formInput;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 2) {
    			 $$invalidate(2, formInput = data.formInput);
    		}
    	};

    	return [
    		calcFullStep,
    		data,
    		formInput,
    		calculateCurrentColors,
    		switch_1_checked_binding
    	];
    }

    class BearingCalculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { data: 1, calcFullStep: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BearingCalculator",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !("data" in props)) {
    			console.warn("<BearingCalculator> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<BearingCalculator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BearingCalculator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get calcFullStep() {
    		throw new Error("<BearingCalculator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set calcFullStep(value) {
    		throw new Error("<BearingCalculator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/BearingResults.svelte generated by Svelte v3.24.0 */
    const file$d = "src/BearingResults.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (67:12) {#each Array(data.numBearings) as _, index}
    function create_each_block_1$3(ctx) {
    	let th;
    	let t0;
    	let t1_value = /*index*/ ctx[8] + 1 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text("#");
    			t1 = text(t1_value);
    			attr_dev(th, "class", "svelte-1ub01dd");
    			add_location(th, file$d, 67, 16, 1898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(67:12) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (75:12) {#each Array(data.numBearings) as _, index}
    function create_each_block$3(ctx) {
    	let td;
    	let raw_value = /*calculateNewColors*/ ctx[3](/*index*/ ctx[8], /*formInput*/ ctx[2], /*calcFullStep*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			td = element("td");
    			add_location(td, file$d, 75, 16, 2101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			td.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formInput, calcFullStep*/ 6 && raw_value !== (raw_value = /*calculateNewColors*/ ctx[3](/*index*/ ctx[8], /*formInput*/ ctx[2], /*calcFullStep*/ ctx[1]) + "")) td.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(75:12) {#each Array(data.numBearings) as _, index}",
    		ctx
    	});

    	return block;
    }

    // (63:0) <Table bordered>
    function create_default_slot$3(ctx) {
    	let thead;
    	let tr0;
    	let th;
    	let t1;
    	let t2;
    	let tbody;
    	let tr1;
    	let td;
    	let t4;
    	let each_value_1 = Array(/*data*/ ctx[0].numBearings);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*data*/ ctx[0].numBearings);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			tr0 = element("tr");
    			th = element("th");
    			th.textContent = "Journal No.";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td = element("td");
    			td.textContent = "Bearing Colors:";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th, "class", "svelte-1ub01dd");
    			add_location(th, file$d, 65, 12, 1805);
    			attr_dev(tr0, "class", "svelte-1ub01dd");
    			add_location(tr0, file$d, 64, 8, 1788);
    			attr_dev(thead, "class", "svelte-1ub01dd");
    			add_location(thead, file$d, 63, 4, 1772);
    			add_location(td, file$d, 73, 12, 2004);
    			add_location(tr1, file$d, 72, 8, 1987);
    			add_location(tbody, file$d, 71, 4, 1971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, tr0);
    			append_dev(tr0, th);
    			append_dev(tr0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, tbody, anchor);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td);
    			append_dev(tr1, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value_1 = Array(/*data*/ ctx[0].numBearings);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*calculateNewColors, formInput, calcFullStep, data*/ 15) {
    				each_value = Array(/*data*/ ctx[0].numBearings);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(63:0) <Table bordered>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let table;
    	let t0;
    	let div;
    	let p0;
    	let t2;
    	let ol;
    	let li0;
    	let t4;
    	let li1;
    	let t6;
    	let p1;
    	let current;

    	table = new Table({
    			props: {
    				bordered: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "If there are no larger bearings available, you may have a few options:";
    			t2 = space();
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "There may be additional aftermarket bearings available that could fit your need.";
    			t4 = space();
    			li1 = element("li");
    			li1.textContent = "If you are building the engine, you may be able to build the C30A to the 3.5L stroker, which has performance bearings available.";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "If those options are not available, you may need to source a new crankshaft from Honda. Contact a professional advisor/engine builder for more information.";
    			attr_dev(p0, "class", "svelte-1ub01dd");
    			add_location(p0, file$d, 82, 4, 2254);
    			add_location(li0, file$d, 86, 8, 2363);
    			add_location(li1, file$d, 87, 8, 2461);
    			add_location(ol, file$d, 85, 4, 2350);
    			attr_dev(p1, "class", "svelte-1ub01dd");
    			add_location(p1, file$d, 89, 4, 2613);
    			attr_dev(div, "id", "results-help");
    			attr_dev(div, "class", "svelte-1ub01dd");
    			add_location(div, file$d, 81, 0, 2226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t2);
    			append_dev(div, ol);
    			append_dev(ol, li0);
    			append_dev(ol, t4);
    			append_dev(ol, li1);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table_changes = {};

    			if (dirty & /*$$scope, data, formInput, calcFullStep*/ 1031) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { data } = $$props;
    	let { calcFullStep = false } = $$props;
    	let bearings = data.bearings;
    	let bearingMap = data.bearingMap;

    	function calculateNewColors(index, formData, useFullStep) {
    		let crankcode = formData.crankrodcode[index];
    		let journalcode = formData.journalcode[index];
    		let colIndex = data.cols.indexOf(crankcode);
    		let rowIndex = data.rows.indexOf(journalcode);

    		if (colIndex < 0 || rowIndex < 0) {
    			return "-";
    		}

    		let [currTopColor, currBottomColor] = bearingMap[rowIndex][colIndex];
    		let nextTopColorExists = currTopColor < bearings.length - 1;
    		let nextBottomColorExists = currBottomColor < bearings.length - 1;

    		if (useFullStep) {
    			if (nextTopColorExists && nextBottomColorExists) {
    				return bearings[currTopColor + 1] + "<br />" + bearings[currBottomColor + 1];
    			}
    		} else {
    			if (nextBottomColorExists && currTopColor == currBottomColor) {
    				return bearings[currTopColor] + "<br />" + bearings[currBottomColor + 1];
    			} else if (nextTopColorExists) {
    				return bearings[currTopColor + 1] + "<br />" + bearings[currBottomColor];
    			}
    		}

    		return "No Available Bearing";
    	}

    	const writable_props = ["data", "calcFullStep"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BearingResults> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("BearingResults", $$slots, []);

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("calcFullStep" in $$props) $$invalidate(1, calcFullStep = $$props.calcFullStep);
    	};

    	$$self.$capture_state = () => ({
    		Table,
    		data,
    		calcFullStep,
    		bearings,
    		bearingMap,
    		calculateNewColors,
    		formInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("calcFullStep" in $$props) $$invalidate(1, calcFullStep = $$props.calcFullStep);
    		if ("bearings" in $$props) bearings = $$props.bearings;
    		if ("bearingMap" in $$props) bearingMap = $$props.bearingMap;
    		if ("formInput" in $$props) $$invalidate(2, formInput = $$props.formInput);
    	};

    	let formInput;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 1) {
    			 $$invalidate(2, formInput = data.formInput);
    		}
    	};

    	return [data, calcFullStep, formInput, calculateNewColors];
    }

    class BearingResults extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { data: 0, calcFullStep: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BearingResults",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<BearingResults> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<BearingResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BearingResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get calcFullStep() {
    		throw new Error("<BearingResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set calcFullStep(value) {
    		throw new Error("<BearingResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Reference.svelte generated by Svelte v3.24.0 */
    const file$e = "src/Reference.svelte";

    // (24:4) {:else}
    function create_else_block_2(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "rod-code",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_9],
    					title: [create_title_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(24:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if mainBearingType}
    function create_if_block_2$2(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "main-bore-code",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_8],
    					title: [create_title_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(17:4) {#if mainBearingType}",
    		ctx
    	});

    	return block;
    }

    // (26:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_7(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Rod Code Locations";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 25, 8, 810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_7.name,
    		type: "slot",
    		source: "(26:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:4) <Accordion id="rod-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_9(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/rod-code-diagram.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 26, 8, 886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(25:4) <Accordion id=\\\"rod-code\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (19:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_6(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Crank Bore Code Locations";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 18, 8, 474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_6.name,
    		type: "slot",
    		source: "(19:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:4) <Accordion id="main-bore-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_8(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/crank-bore-location.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 19, 8, 557);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(18:4) <Accordion id=\\\"main-bore-code\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (40:4) {:else}
    function create_else_block_1(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "rod-journal-code",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_7],
    					title: [create_title_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(40:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#if mainBearingType}
    function create_if_block_1$2(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "main-journal-code",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_6],
    					title: [create_title_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(33:4) {#if mainBearingType}",
    		ctx
    	});

    	return block;
    }

    // (42:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Rod Journal Code Locations";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 41, 8, 1520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_5.name,
    		type: "slot",
    		source: "(42:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:4) <Accordion id="rod-journal-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_7(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/crank-rod-journal-code.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 42, 8, 1604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(41:4) <Accordion id=\\\"rod-journal-code\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (35:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Main Journal Code Locations";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 34, 8, 1170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_4.name,
    		type: "slot",
    		source: "(35:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (34:4) <Accordion id="main-journal-code" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_6(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/crank-main-journal-code.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 35, 8, 1255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(34:4) <Accordion id=\\\"main-journal-code\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (56:4) {:else}
    function create_else_block$3(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "rod-bearing-chart",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_5],
    					title: [create_title_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(56:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if mainBearingType}
    function create_if_block$4(ctx) {
    	let accordion;
    	let current;

    	accordion = new Accordion({
    			props: {
    				id: "main-bearing-chart",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_4],
    					title: [create_title_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(accordion.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion_changes.$$scope = { dirty, ctx };
    			}

    			accordion.$set(accordion_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(49:4) {#if mainBearingType}",
    		ctx
    	});

    	return block;
    }

    // (58:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Rod Bearing Identification Chart";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 57, 8, 2247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_3.name,
    		type: "slot",
    		source: "(58:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (57:4) <Accordion id="rod-bearing-chart" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_5(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/rod-bearing-chart.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 58, 8, 2337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(57:4) <Accordion id=\\\"rod-bearing-chart\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (51:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Main Bearing Identification Chart";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 50, 8, 1895);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_2.name,
    		type: "slot",
    		source: "(51:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (50:4) <Accordion id="main-bearing-chart" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_4(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/main-bearing-chart.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 51, 8, 1986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(50:4) <Accordion id=\\\"main-bearing-chart\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Accordions>
    function create_default_slot_3(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let current_block_type_index_1;
    	let if_block1;
    	let t1;
    	let current_block_type_index_2;
    	let if_block2;
    	let if_block2_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mainBearingType*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const if_block_creators_1 = [create_if_block_1$2, create_else_block_1];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*mainBearingType*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	const if_block_creators_2 = [create_if_block$4, create_else_block$3];
    	const if_blocks_2 = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*mainBearingType*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index_2 = select_block_type_2(ctx);
    	if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if_blocks_1[current_block_type_index_1].m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks_2[current_block_type_index_2].m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(t0.parentNode, t0);
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 === previous_block_index_1) {
    				if_blocks_1[current_block_type_index_1].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(t1.parentNode, t1);
    			}

    			let previous_block_index_2 = current_block_type_index_2;
    			current_block_type_index_2 = select_block_type_2(ctx);

    			if (current_block_type_index_2 === previous_block_index_2) {
    				if_blocks_2[current_block_type_index_2].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks_2[previous_block_index_2], 1, 1, () => {
    					if_blocks_2[previous_block_index_2] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks_2[current_block_type_index_2];

    				if (!if_block2) {
    					if_block2 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
    					if_block2.c();
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t0);
    			if_blocks_1[current_block_type_index_1].d(detaching);
    			if (detaching) detach_dev(t1);
    			if_blocks_2[current_block_type_index_2].d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(16:0) <Accordions>",
    		ctx
    	});

    	return block;
    }

    // (72:8) <span slot="title" class="valign-wrapper">
    function create_title_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Engine Layout Diagram & Journal Numbers";
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 71, 8, 2667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(72:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (71:4) <Accordion id="engine-layout" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>
    function create_default_slot_2(ctx) {
    	let t;
    	let span;
    	let image;
    	let current;

    	image = new Image({
    			props: {
    				thumbnail: true,
    				img: "./static/engine-diagram.png",
    				height: "800",
    				width: "800"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t = space();
    			span = element("span");
    			create_component(image.$$.fragment);
    			add_location(span, file$e, 72, 8, 2764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, span, anchor);
    			mount_component(image, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(span);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(71:4) <Accordion id=\\\"engine-layout\\\" {openedAccordion} on:accordionSelected={toggleAccordion} secondary>",
    		ctx
    	});

    	return block;
    }

    // (79:8) <span slot="title" class="valign-wrapper">
    function create_title_slot(ctx) {
    	let span;
    	let a;

    	const block = {
    		c: function create() {
    			span = element("span");
    			a = element("a");
    			a.textContent = "1991 - 1995 Honda NSX Service Manual (Engine Service)";
    			attr_dev(a, "class", "manual-download svelte-zts0c7");
    			attr_dev(a, "href", "./static/C30A-Service-Manual-Engine-Bearings.pdf");
    			attr_dev(a, "download", "");
    			add_location(a, file$e, 79, 12, 3023);
    			attr_dev(span, "slot", "title");
    			attr_dev(span, "class", "valign-wrapper");
    			add_location(span, file$e, 78, 8, 2968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(79:8) <span slot=\\\"title\\\" class=\\\"valign-wrapper\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:0) <Accordions>
    function create_default_slot$4(ctx) {
    	let accordion0;
    	let t;
    	let accordion1;
    	let current;

    	accordion0 = new Accordion({
    			props: {
    				id: "engine-layout",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: {
    					default: [create_default_slot_2],
    					title: [create_title_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordion0.$on("accordionSelected", /*toggleAccordion*/ ctx[2]);

    	accordion1 = new Accordion({
    			props: {
    				id: "service-manual",
    				openedAccordion: /*openedAccordion*/ ctx[1],
    				secondary: true,
    				$$slots: { title: [create_title_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(accordion0.$$.fragment);
    			t = space();
    			create_component(accordion1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordion0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(accordion1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const accordion0_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion0_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion0_changes.$$scope = { dirty, ctx };
    			}

    			accordion0.$set(accordion0_changes);
    			const accordion1_changes = {};
    			if (dirty & /*openedAccordion*/ 2) accordion1_changes.openedAccordion = /*openedAccordion*/ ctx[1];

    			if (dirty & /*$$scope*/ 8) {
    				accordion1_changes.$$scope = { dirty, ctx };
    			}

    			accordion1.$set(accordion1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordion0.$$.fragment, local);
    			transition_in(accordion1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordion0.$$.fragment, local);
    			transition_out(accordion1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordion0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(accordion1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(70:0) <Accordions>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let accordions0;
    	let t0;
    	let br;
    	let t1;
    	let h3;
    	let t3;
    	let hr;
    	let t4;
    	let accordions1;
    	let current;

    	accordions0 = new Accordions({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	accordions1 = new Accordions({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(accordions0.$$.fragment);
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Additional Information:";
    			t3 = space();
    			hr = element("hr");
    			t4 = space();
    			create_component(accordions1.$$.fragment);
    			add_location(br, file$e, 65, 0, 2496);
    			add_location(h3, file$e, 67, 0, 2504);
    			add_location(hr, file$e, 68, 0, 2537);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(accordions0, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(accordions1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const accordions0_changes = {};

    			if (dirty & /*$$scope, openedAccordion, mainBearingType*/ 11) {
    				accordions0_changes.$$scope = { dirty, ctx };
    			}

    			accordions0.$set(accordions0_changes);
    			const accordions1_changes = {};

    			if (dirty & /*$$scope, openedAccordion*/ 10) {
    				accordions1_changes.$$scope = { dirty, ctx };
    			}

    			accordions1.$set(accordions1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(accordions0.$$.fragment, local);
    			transition_in(accordions1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(accordions0.$$.fragment, local);
    			transition_out(accordions1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(accordions0, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t4);
    			destroy_component(accordions1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { mainBearingType } = $$props;
    	let openedAccordion = 0;
    	const toggleAccordion = e => $$invalidate(1, openedAccordion = e.detail == openedAccordion ? 0 : e.detail);
    	const writable_props = ["mainBearingType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reference> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Reference", $$slots, []);

    	$$self.$set = $$props => {
    		if ("mainBearingType" in $$props) $$invalidate(0, mainBearingType = $$props.mainBearingType);
    	};

    	$$self.$capture_state = () => ({
    		Accordions,
    		Accordion,
    		Image,
    		mainBearingType,
    		openedAccordion,
    		toggleAccordion
    	});

    	$$self.$inject_state = $$props => {
    		if ("mainBearingType" in $$props) $$invalidate(0, mainBearingType = $$props.mainBearingType);
    		if ("openedAccordion" in $$props) $$invalidate(1, openedAccordion = $$props.openedAccordion);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mainBearingType, openedAccordion, toggleAccordion];
    }

    class Reference extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { mainBearingType: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reference",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*mainBearingType*/ ctx[0] === undefined && !("mainBearingType" in props)) {
    			console.warn("<Reference> was created without expected prop 'mainBearingType'");
    		}
    	}

    	get mainBearingType() {
    		throw new Error("<Reference>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mainBearingType(value) {
    		throw new Error("<Reference>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Page.svelte generated by Svelte v3.24.0 */
    const file$f = "src/Page.svelte";

    function create_fragment$f(ctx) {
    	let div2;
    	let div0;
    	let h30;
    	let t1;
    	let hr0;
    	let t2;
    	let bearingform;
    	let updating_results;
    	let t3;
    	let br0;
    	let t4;
    	let br1;
    	let t5;
    	let h31;
    	let t7;
    	let hr1;
    	let t8;
    	let bearingcomparator;
    	let updating_calcFullStep;
    	let t9;
    	let br2;
    	let t10;
    	let br3;
    	let t11;
    	let h32;
    	let t13;
    	let hr2;
    	let t14;
    	let bearingresults;
    	let updating_calcFullStep_1;
    	let t15;
    	let br4;
    	let t16;
    	let br5;
    	let t17;
    	let br6;
    	let t18;
    	let div1;
    	let h33;
    	let t20;
    	let hr3;
    	let t21;
    	let reference;
    	let current;

    	function bearingform_results_binding(value) {
    		/*bearingform_results_binding*/ ctx[2].call(null, value);
    	}

    	let bearingform_props = { data: /*bearingData*/ ctx[0] };

    	if (/*bearingData*/ ctx[0].formInput !== void 0) {
    		bearingform_props.results = /*bearingData*/ ctx[0].formInput;
    	}

    	bearingform = new BearingForm({ props: bearingform_props, $$inline: true });
    	binding_callbacks.push(() => bind(bearingform, "results", bearingform_results_binding));

    	function bearingcomparator_calcFullStep_binding(value) {
    		/*bearingcomparator_calcFullStep_binding*/ ctx[3].call(null, value);
    	}

    	let bearingcomparator_props = { data: /*bearingData*/ ctx[0] };

    	if (/*calcFullStep*/ ctx[1] !== void 0) {
    		bearingcomparator_props.calcFullStep = /*calcFullStep*/ ctx[1];
    	}

    	bearingcomparator = new BearingCalculator({
    			props: bearingcomparator_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(bearingcomparator, "calcFullStep", bearingcomparator_calcFullStep_binding));

    	function bearingresults_calcFullStep_binding(value) {
    		/*bearingresults_calcFullStep_binding*/ ctx[4].call(null, value);
    	}

    	let bearingresults_props = { data: /*bearingData*/ ctx[0] };

    	if (/*calcFullStep*/ ctx[1] !== void 0) {
    		bearingresults_props.calcFullStep = /*calcFullStep*/ ctx[1];
    	}

    	bearingresults = new BearingResults({
    			props: bearingresults_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(bearingresults, "calcFullStep", bearingresults_calcFullStep_binding));

    	reference = new Reference({
    			props: {
    				mainBearingType: /*bearingData*/ ctx[0].numBearings == 4
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Input Engine Codes:";
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			create_component(bearingform.$$.fragment);
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			h31 = element("h3");
    			h31.textContent = "Stock Bearing Colors (Originally Installed by Honda):";
    			t7 = space();
    			hr1 = element("hr");
    			t8 = space();
    			create_component(bearingcomparator.$$.fragment);
    			t9 = space();
    			br2 = element("br");
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			h32 = element("h3");
    			h32.textContent = "New Engine Bearings:";
    			t13 = space();
    			hr2 = element("hr");
    			t14 = space();
    			create_component(bearingresults.$$.fragment);
    			t15 = space();
    			br4 = element("br");
    			t16 = space();
    			br5 = element("br");
    			t17 = space();
    			br6 = element("br");
    			t18 = space();
    			div1 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Reference:";
    			t20 = space();
    			hr3 = element("hr");
    			t21 = space();
    			create_component(reference.$$.fragment);
    			add_location(h30, file$f, 55, 8, 1114);
    			add_location(hr0, file$f, 56, 8, 1151);
    			add_location(br0, file$f, 58, 8, 1245);
    			add_location(br1, file$f, 59, 8, 1260);
    			add_location(h31, file$f, 60, 8, 1275);
    			add_location(hr1, file$f, 61, 8, 1346);
    			add_location(br2, file$f, 63, 8, 1442);
    			add_location(br3, file$f, 64, 8, 1457);
    			add_location(h32, file$f, 65, 8, 1472);
    			add_location(hr2, file$f, 66, 8, 1510);
    			add_location(br4, file$f, 68, 8, 1603);
    			add_location(br5, file$f, 69, 8, 1618);
    			add_location(br6, file$f, 70, 8, 1633);
    			attr_dev(div0, "id", "input-column");
    			attr_dev(div0, "class", "svelte-bs3b0p");
    			add_location(div0, file$f, 54, 4, 1082);
    			add_location(h33, file$f, 73, 8, 1691);
    			add_location(hr3, file$f, 74, 8, 1719);
    			attr_dev(div1, "id", "reference-column");
    			attr_dev(div1, "class", "svelte-bs3b0p");
    			add_location(div1, file$f, 72, 4, 1655);
    			attr_dev(div2, "id", "main-view");
    			attr_dev(div2, "class", "svelte-bs3b0p");
    			add_location(div2, file$f, 53, 0, 1057);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t1);
    			append_dev(div0, hr0);
    			append_dev(div0, t2);
    			mount_component(bearingform, div0, null);
    			append_dev(div0, t3);
    			append_dev(div0, br0);
    			append_dev(div0, t4);
    			append_dev(div0, br1);
    			append_dev(div0, t5);
    			append_dev(div0, h31);
    			append_dev(div0, t7);
    			append_dev(div0, hr1);
    			append_dev(div0, t8);
    			mount_component(bearingcomparator, div0, null);
    			append_dev(div0, t9);
    			append_dev(div0, br2);
    			append_dev(div0, t10);
    			append_dev(div0, br3);
    			append_dev(div0, t11);
    			append_dev(div0, h32);
    			append_dev(div0, t13);
    			append_dev(div0, hr2);
    			append_dev(div0, t14);
    			mount_component(bearingresults, div0, null);
    			append_dev(div0, t15);
    			append_dev(div0, br4);
    			append_dev(div0, t16);
    			append_dev(div0, br5);
    			append_dev(div0, t17);
    			append_dev(div0, br6);
    			append_dev(div2, t18);
    			append_dev(div2, div1);
    			append_dev(div1, h33);
    			append_dev(div1, t20);
    			append_dev(div1, hr3);
    			append_dev(div1, t21);
    			mount_component(reference, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const bearingform_changes = {};
    			if (dirty & /*bearingData*/ 1) bearingform_changes.data = /*bearingData*/ ctx[0];

    			if (!updating_results && dirty & /*bearingData*/ 1) {
    				updating_results = true;
    				bearingform_changes.results = /*bearingData*/ ctx[0].formInput;
    				add_flush_callback(() => updating_results = false);
    			}

    			bearingform.$set(bearingform_changes);
    			const bearingcomparator_changes = {};
    			if (dirty & /*bearingData*/ 1) bearingcomparator_changes.data = /*bearingData*/ ctx[0];

    			if (!updating_calcFullStep && dirty & /*calcFullStep*/ 2) {
    				updating_calcFullStep = true;
    				bearingcomparator_changes.calcFullStep = /*calcFullStep*/ ctx[1];
    				add_flush_callback(() => updating_calcFullStep = false);
    			}

    			bearingcomparator.$set(bearingcomparator_changes);
    			const bearingresults_changes = {};
    			if (dirty & /*bearingData*/ 1) bearingresults_changes.data = /*bearingData*/ ctx[0];

    			if (!updating_calcFullStep_1 && dirty & /*calcFullStep*/ 2) {
    				updating_calcFullStep_1 = true;
    				bearingresults_changes.calcFullStep = /*calcFullStep*/ ctx[1];
    				add_flush_callback(() => updating_calcFullStep_1 = false);
    			}

    			bearingresults.$set(bearingresults_changes);
    			const reference_changes = {};
    			if (dirty & /*bearingData*/ 1) reference_changes.mainBearingType = /*bearingData*/ ctx[0].numBearings == 4;
    			reference.$set(reference_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bearingform.$$.fragment, local);
    			transition_in(bearingcomparator.$$.fragment, local);
    			transition_in(bearingresults.$$.fragment, local);
    			transition_in(reference.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bearingform.$$.fragment, local);
    			transition_out(bearingcomparator.$$.fragment, local);
    			transition_out(bearingresults.$$.fragment, local);
    			transition_out(reference.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(bearingform);
    			destroy_component(bearingcomparator);
    			destroy_component(bearingresults);
    			destroy_component(reference);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { bearingData = {
    		numBearings: 0,
    		cols: [],
    		rows: [],
    		bearingList: cols,
    		bearings: [],
    		bearingMap: [],
    		formInput: {
    			"crankrodcode": { 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" },
    			"journalcode": { 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" }
    		},
    		colName: "",
    		rowName: ""
    	} } = $$props;

    	const writable_props = ["bearingData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Page", $$slots, []);

    	function bearingform_results_binding(value) {
    		bearingData.formInput = value;
    		$$invalidate(0, bearingData);
    	}

    	function bearingcomparator_calcFullStep_binding(value) {
    		calcFullStep = value;
    		$$invalidate(1, calcFullStep);
    	}

    	function bearingresults_calcFullStep_binding(value) {
    		calcFullStep = value;
    		$$invalidate(1, calcFullStep);
    	}

    	$$self.$set = $$props => {
    		if ("bearingData" in $$props) $$invalidate(0, bearingData = $$props.bearingData);
    	};

    	$$self.$capture_state = () => ({
    		BearingForm,
    		BearingComparator: BearingCalculator,
    		BearingResults,
    		Reference,
    		bearingData,
    		calcFullStep
    	});

    	$$self.$inject_state = $$props => {
    		if ("bearingData" in $$props) $$invalidate(0, bearingData = $$props.bearingData);
    		if ("calcFullStep" in $$props) $$invalidate(1, calcFullStep = $$props.calcFullStep);
    	};

    	let calcFullStep;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, calcFullStep = false);

    	return [
    		bearingData,
    		calcFullStep,
    		bearingform_results_binding,
    		bearingcomparator_calcFullStep_binding,
    		bearingresults_calcFullStep_binding
    	];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { bearingData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get bearingData() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bearingData(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.24.0 */

    const file$g = "src/Footer.svelte";

    function create_fragment$g(ctx) {
    	let footer;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let p2;
    	let t7;
    	let t8;
    	let t9;
    	let a2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p0 = element("p");
    			p0.textContent = "Honda C30A Bearing Calculator";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Made with ");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t4 = text(" and ");
    			a1 = element("a");
    			a1.textContent = "Svelteit";
    			t6 = space();
    			p2 = element("p");
    			t7 = text("© ");
    			t8 = text(/*copyrightRange*/ ctx[0]);
    			t9 = text(" - ");
    			a2 = element("a");
    			a2.textContent = "Jon Stohler";
    			attr_dev(p0, "id", "title");
    			attr_dev(p0, "class", "svelte-13rvkbl");
    			add_location(p0, file$g, 23, 4, 412);
    			attr_dev(a0, "href", "https://svelte.dev");
    			add_location(a0, file$g, 24, 17, 477);
    			attr_dev(a1, "href", "https://docs.svelteit.dev/");
    			add_location(a1, file$g, 24, 61, 521);
    			add_location(p1, file$g, 24, 4, 464);
    			attr_dev(a2, "href", "https://github.com/jstohler");
    			add_location(a2, file$g, 25, 43, 618);
    			attr_dev(p2, "id", "copyright");
    			attr_dev(p2, "class", "svelte-13rvkbl");
    			add_location(p2, file$g, 25, 4, 579);
    			attr_dev(footer, "class", "svelte-13rvkbl");
    			add_location(footer, file$g, 22, 0, 399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p0);
    			append_dev(footer, t1);
    			append_dev(footer, p1);
    			append_dev(p1, t2);
    			append_dev(p1, a0);
    			append_dev(p1, t4);
    			append_dev(p1, a1);
    			append_dev(footer, t6);
    			append_dev(footer, p2);
    			append_dev(p2, t7);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(p2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let year = new Date().getFullYear();
    	let copyrightRange = year === 2020 ? "2020" : "2020 - " + year;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ year, copyrightRange });

    	$$self.$inject_state = $$props => {
    		if ("year" in $$props) year = $$props.year;
    		if ("copyrightRange" in $$props) $$invalidate(0, copyrightRange = $$props.copyrightRange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [copyrightRange];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */
    const file$h = "src/App.svelte";

    // (135:2) <Button outlined={showInfo} secondary={showInfo} on:click={toggleInfo}>
    function create_default_slot_7$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("What is this Calculator for?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(135:2) <Button outlined={showInfo} secondary={showInfo} on:click={toggleInfo}>",
    		ctx
    	});

    	return block;
    }

    // (136:2) <Button outlined={showDetailedInfo} secondary={showDetailedInfo} on:click={toggleDetailedInfo}>
    function create_default_slot_6$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("How does this Calculator work?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(136:2) <Button outlined={showDetailedInfo} secondary={showDetailedInfo} on:click={toggleDetailedInfo}>",
    		ctx
    	});

    	return block;
    }

    // (209:2) <Tab>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main Bearings");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(209:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (210:2) <Tab>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Rod Bearings");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(210:2) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (208:1) <TabList>
    function create_default_slot_3$1(ctx) {
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(tab1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(tab1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(208:1) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (213:1) <TabPanel>
    function create_default_slot_2$1(ctx) {
    	let page;
    	let current;

    	page = new Page({
    			props: { bearingData: /*mainBearingData*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(213:1) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (217:1) <TabPanel>
    function create_default_slot_1$1(ctx) {
    	let page;
    	let current;

    	page = new Page({
    			props: { bearingData: /*rodBearingData*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(217:1) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (207:0) <Tabs>
    function create_default_slot$5(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(207:0) <Tabs>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let h1;
    	let t1;
    	let hr;
    	let t2;
    	let div0;
    	let button0;
    	let t3;
    	let button1;
    	let t4;
    	let div3;
    	let div1;
    	let h40;
    	let t6;
    	let p0;
    	let t8;
    	let p1;
    	let t10;
    	let p2;
    	let t12;
    	let div2;
    	let h41;
    	let t14;
    	let p3;
    	let t16;
    	let p4;
    	let t18;
    	let p5;
    	let t19;
    	let a0;
    	let t21;
    	let t22;
    	let p6;
    	let t24;
    	let p7;
    	let t26;
    	let p8;
    	let t28;
    	let p9;
    	let t29;
    	let a1;
    	let t31;
    	let t32;
    	let p10;
    	let t34;
    	let div4;
    	let h42;
    	let t36;
    	let p11;
    	let t38;
    	let p12;
    	let strong;
    	let t40;
    	let tabs;
    	let t41;
    	let footer;
    	let current;

    	button0 = new Button({
    			props: {
    				outlined: /*showInfo*/ ctx[0],
    				secondary: /*showInfo*/ ctx[0],
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*toggleInfo*/ ctx[5]);

    	button1 = new Button({
    			props: {
    				outlined: /*showDetailedInfo*/ ctx[1],
    				secondary: /*showDetailedInfo*/ ctx[1],
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*toggleDetailedInfo*/ ctx[4]);

    	tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Honda C30A Main & Rod Bearing Calculator";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "What is this Calculator for?";
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "This is a calculator used to determine which Main Bearings and Rod Bearings to purchase and install when rebuilding a Honda C30A engine.";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Selecting these bearings was easily the most difficult part during the rebuild of my 1991 NSX. \n\t\t\tThe NSX Service manual doesn't describe the process of determing which bearings to choose when rebuilding the engine, only identifying which bearings were originally installed.\n\t\t\tI searched online to see if there was any easier process of determining which bearings to use and couldn't find a clear explaination.";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "I created this calculator to make the bearing selection process easier for anyone who is rebuilding their C30A.";
    			t12 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			h41.textContent = "How does this Calculator work?";
    			t14 = space();
    			p3 = element("p");
    			p3.textContent = "When rebuilding an engine, the bearings that sit between the crankshaft and the connecting rods will have been worn down over time and should be replaced.";
    			t16 = space();
    			p4 = element("p");
    			p4.textContent = "The main and rod bearings are used to transfer power from the pistons to the crankshaft, which then provides power to the transmission and wheels. \n\t\t\tThe bearings that connect the crankshaft and piston have very small tolerances, even more so with higher revving and more performance oriented engines.";
    			t18 = space();
    			p5 = element("p");
    			t19 = text("If the bearings are too small or worn, they will slide around and cause the connecting rods to beat into the crankshaft over time, ");
    			a0 = element("a");
    			a0.textContent = "severely damaging it";
    			t21 = text(".\n\t\t\tIf the bearings are too large, they will not correctly fit over the crankshaft, which will cause it to break apart or come loose while running, which can destroy the block.");
    			t22 = space();
    			p6 = element("p");
    			p6.textContent = "It is very important to install the correct bearing, so that the engine will be able to operate at its fullest capacity without damanging itself.\n\t\t\tSince these bearings have tolerances of 1/100th to 1/1000th of an inch, it can be difficult to determine which bearing to use.";
    			t24 = space();
    			p7 = element("p");
    			p7.textContent = "When selecting bearings for common, non-performance oriented engines (like a Toyota 22RE), there are typically aftermarket bearings available that will 'form' itself to fit within a 1/100ths of an inch.\n\t\t\tWith rarer, performance engines (like the C30A), the tolerances are either too small for bearings to 'form' itself to fit within 1/1000ths of an inch, or are too rare for aftermarket manufacturers to make.";
    			t26 = space();
    			p8 = element("p");
    			p8.textContent = "Honda created a series of color-coded bearings (each of a specific thickness to 1/1000ths of an inch) for use in the C30A engine.\n\t\t\tTo help identify which color bearings were originally installed, Honda stamped each engine block, crankshaft, and connecting rods with various codes.\n\t\t\tThe engine codes map to a table of bearing colors listed in their 'Bearing Identification Chart' on the C30A Service Manual.\n\t\t\tWith all of this information, it's possible to determine which bearing colors were originally installed from the factory.";
    			t28 = space();
    			p9 = element("p");
    			t29 = text("However, over the life of an engine, the bearings will wear down overtime and cause slight damage to the crankshaft, connecting rods, and block.\n\t\t\tWhen rebuilding an engine, this wear is fixed via ");
    			a1 = element("a");
    			a1.textContent = "micro-polishing (grinding)";
    			t31 = text(", which will smooth out any imperfections but remove material from the engine components.\n\t\t\tSince these bearings require extremely tight tolerances, the new bearings will need to be thicker to make up for the removed material.\n\t\t\tIf there is a large amount of wear on the crankshaft/rod that needs to be fixed, it will require an even thicker bearing to precisely fit.");
    			t32 = space();
    			p10 = element("p");
    			p10.textContent = "This calculator provides the ability to calculate which bearings were originally installed, the next size of bearings that will need to be installed, and the next 'full' size of bearings that may need to be installed if there is moderate damage to the crankshaft or rod.";
    			t34 = space();
    			div4 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Disclaimer";
    			t36 = space();
    			p11 = element("p");
    			p11.textContent = "This calculator is a tool to help determine which bearings you MAY need, but each engine is unique. \n\t\tYour bearing needs may vary depending on crankshaft wear and engine condition. \n\t\tAlways double check calculated bearings with a professional advisor/engine builder. \n\t\tInstalling an incorrectly sized bearing could cause premature wear or damage your engine!";
    			t38 = space();
    			p12 = element("p");
    			strong = element("strong");
    			strong.textContent = "By using this tool, you assume all liability for any damage or loss caused by installing incorrect bearings!";
    			t40 = space();
    			create_component(tabs.$$.fragment);
    			t41 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "svelte-1rvq84u");
    			add_location(h1, file$h, 130, 0, 2733);
    			add_location(hr, file$h, 131, 0, 2783);
    			attr_dev(div0, "id", "info-buttons");
    			attr_dev(div0, "class", "svelte-1rvq84u");
    			add_location(div0, file$h, 133, 0, 2791);
    			attr_dev(h40, "class", "svelte-1rvq84u");
    			add_location(h40, file$h, 140, 2, 3144);
    			add_location(p0, file$h, 141, 2, 3184);
    			add_location(p1, file$h, 144, 2, 3339);
    			add_location(p2, file$h, 149, 2, 3768);
    			attr_dev(div1, "class", "info-box svelte-1rvq84u");
    			toggle_class(div1, "hidden", !/*showInfo*/ ctx[0]);
    			add_location(div1, file$h, 139, 1, 3094);
    			attr_dev(h41, "class", "svelte-1rvq84u");
    			add_location(h41, file$h, 155, 2, 3963);
    			add_location(p3, file$h, 156, 2, 4005);
    			add_location(p4, file$h, 159, 2, 4176);
    			attr_dev(a0, "href", "https://mechanics.stackexchange.com/a/21056");
    			add_location(a0, file$h, 164, 134, 4633);
    			add_location(p5, file$h, 163, 2, 4495);
    			add_location(p6, file$h, 167, 2, 4898);
    			add_location(p7, file$h, 171, 2, 5190);
    			add_location(p8, file$h, 175, 2, 5618);
    			attr_dev(a1, "href", "https://mechanics.stackexchange.com/a/40797");
    			add_location(a1, file$h, 183, 53, 6375);
    			add_location(p9, file$h, 181, 2, 6170);
    			add_location(p10, file$h, 187, 2, 6838);
    			attr_dev(div2, "class", "info-box svelte-1rvq84u");
    			toggle_class(div2, "hidden", !/*showDetailedInfo*/ ctx[1]);
    			add_location(div2, file$h, 154, 1, 3905);
    			attr_dev(div3, "id", "info-group");
    			add_location(div3, file$h, 138, 0, 3071);
    			attr_dev(h42, "class", "svelte-1rvq84u");
    			add_location(h42, file$h, 194, 1, 7179);
    			add_location(p11, file$h, 195, 1, 7200);
    			add_location(strong, file$h, 202, 2, 7594);
    			attr_dev(p12, "class", "warn svelte-1rvq84u");
    			add_location(p12, file$h, 201, 1, 7575);
    			attr_dev(div4, "id", "disclaimer");
    			attr_dev(div4, "class", "info-box svelte-1rvq84u");
    			add_location(div4, file$h, 193, 0, 7139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			append_dev(div0, t3);
    			mount_component(button1, div0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t6);
    			append_dev(div1, p0);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div1, t10);
    			append_dev(div1, p2);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, h41);
    			append_dev(div2, t14);
    			append_dev(div2, p3);
    			append_dev(div2, t16);
    			append_dev(div2, p4);
    			append_dev(div2, t18);
    			append_dev(div2, p5);
    			append_dev(p5, t19);
    			append_dev(p5, a0);
    			append_dev(p5, t21);
    			append_dev(div2, t22);
    			append_dev(div2, p6);
    			append_dev(div2, t24);
    			append_dev(div2, p7);
    			append_dev(div2, t26);
    			append_dev(div2, p8);
    			append_dev(div2, t28);
    			append_dev(div2, p9);
    			append_dev(p9, t29);
    			append_dev(p9, a1);
    			append_dev(p9, t31);
    			append_dev(div2, t32);
    			append_dev(div2, p10);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h42);
    			append_dev(div4, t36);
    			append_dev(div4, p11);
    			append_dev(div4, t38);
    			append_dev(div4, p12);
    			append_dev(p12, strong);
    			insert_dev(target, t40, anchor);
    			mount_component(tabs, target, anchor);
    			insert_dev(target, t41, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};
    			if (dirty & /*showInfo*/ 1) button0_changes.outlined = /*showInfo*/ ctx[0];
    			if (dirty & /*showInfo*/ 1) button0_changes.secondary = /*showInfo*/ ctx[0];

    			if (dirty & /*$$scope*/ 64) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*showDetailedInfo*/ 2) button1_changes.outlined = /*showDetailedInfo*/ ctx[1];
    			if (dirty & /*showDetailedInfo*/ 2) button1_changes.secondary = /*showDetailedInfo*/ ctx[1];

    			if (dirty & /*$$scope*/ 64) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (dirty & /*showInfo*/ 1) {
    				toggle_class(div1, "hidden", !/*showInfo*/ ctx[0]);
    			}

    			if (dirty & /*showDetailedInfo*/ 2) {
    				toggle_class(div2, "hidden", !/*showDetailedInfo*/ ctx[1]);
    			}

    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t40);
    			destroy_component(tabs, detaching);
    			if (detaching) detach_dev(t41);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let mainBearingData = {
    		numBearings: 4,
    		cols: ["A", "B", "C", "D"],
    		rows: ["1", "2", "3", "4", "5", "6"],
    		bearings: ["Pink", "Yellow", "Green", "Brown", "Black"],
    		bearingMap: [
    			[[0, 0], [0, 1], [1, 1], [1, 2]],
    			[[0, 1], [1, 1], [1, 2], [2, 2]],
    			[[1, 1], [1, 2], [2, 2], [2, 3]],
    			[[1, 2], [2, 2], [2, 3], [3, 3]],
    			[[2, 2], [2, 3], [3, 3], [3, 4]],
    			[[2, 3], [3, 3], [3, 4], [4, 4]]
    		],
    		formInput: {
    			"crankrodcode": { 0: "", 1: "", 2: "", 3: "" },
    			"journalcode": { 0: "", 1: "", 2: "", 3: "" }
    		},
    		colName: "Crank Bore Codes",
    		rowName: "Main Journal Codes"
    	};

    	let rodBearingData = {
    		numBearings: 6,
    		cols: ["1", "2", "3", "4"],
    		rows: ["A", "B", "C", "D", "E", "F"],
    		bearings: ["Red", "Pink", "Yellow", "Green", "Brown", "Black"],
    		bearingMap: [
    			[[0, 0], [0, 1], [1, 2], [2, 2]],
    			[[0, 1], [1, 2], [2, 2], [2, 3]],
    			[[1, 2], [2, 2], [2, 3], [3, 4]],
    			[[2, 2], [2, 3], [3, 4], [4, 4]],
    			[[2, 3], [3, 4], [4, 4], [4, 5]],
    			[[3, 4], [4, 4], [4, 5], [5, 5]]
    		],
    		formInput: {
    			"crankrodcode": {
    				0: "",
    				1: "",
    				2: "",
    				3: "",
    				4: "",
    				5: "",
    				6: ""
    			},
    			"journalcode": {
    				0: "",
    				1: "",
    				2: "",
    				3: "",
    				4: "",
    				5: "",
    				6: ""
    			}
    		},
    		colName: "Rod Codes",
    		rowName: "Rod Journal Codes"
    	};

    	let showInfo = false;
    	let showDetailedInfo = false;

    	function toggleDetailedInfo() {
    		$$invalidate(1, showDetailedInfo = !showDetailedInfo);
    	}

    	function toggleInfo() {
    		$$invalidate(0, showInfo = !showInfo);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Page,
    		Footer,
    		Tabs,
    		TabList,
    		Tab,
    		TabPanel,
    		Button,
    		mainBearingData,
    		rodBearingData,
    		showInfo,
    		showDetailedInfo,
    		toggleDetailedInfo,
    		toggleInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ("mainBearingData" in $$props) $$invalidate(2, mainBearingData = $$props.mainBearingData);
    		if ("rodBearingData" in $$props) $$invalidate(3, rodBearingData = $$props.rodBearingData);
    		if ("showInfo" in $$props) $$invalidate(0, showInfo = $$props.showInfo);
    		if ("showDetailedInfo" in $$props) $$invalidate(1, showDetailedInfo = $$props.showDetailedInfo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showInfo,
    		showDetailedInfo,
    		mainBearingData,
    		rodBearingData,
    		toggleDetailedInfo,
    		toggleInfo
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
