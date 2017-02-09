/* Tween engine for JavaScript animations. // TODO
 *
 * ```javascript
 * var pos = {x: 0, y: 0};
 *
 * var tween = new Tween(pos);
 * tween.to({x: 100, y: 100}, 1000)
 *      .on('update', function (target)
 *      {
 *          console.log(target.x, target.y);
 *      })
 *      .play();
 * ```
 */

_('Emitter State easing now each raf isFn');

exports = Emitter.extend({
    className: 'Tween',
    initialize: function (target)
    {
        this.callSuper(Emitter, 'initialize', arguments);

        this._target = target;
        this._dest = {};
        this._duration = 0;
        this._progress = 0;
        this._origin = {};
        this._diff = {};
        this._ease = easing['linear'];
        this._state = new State('pause', {
            play: {from: 'pause', to: 'play'},
            pause: {from: 'play', to: 'pause'}
        });
    },
    to: function (props, duration, ease)
    {
        var origin = {},
            target = this._target,
            diff = {};

        ease = ease || this._ease;

        this._dest = props;
        this._duration = duration || this._duration;
        this._ease = isFn(ease) ? ease : easing[ease];

        each(props, function (val, key)
        {
            origin[key] = target[key];
            diff[key] = val - origin[key];
        });

        this._origin = origin;
        this._diff = diff;

        return this;
    },
    progress: function (progress)
    {
        var ease = this._ease,
            target = this._target,
            origin = this._origin,
            diff = this._diff,
            dest = this._dest,
            self = this;

        if (progress != null)
        {
            progress = progress < 1 ? progress : 1;
            this._progress = progress;

            if (progress === 1)
            {
                each(dest, function (val, key) { target[key] = val });
                return;
            }

            each(dest, function (val, key)
            {
                target[key] = origin[key] + diff[key] * ease(progress);
            });

            self.emit('update', target);

            return this;
        }

        return this._progress;
    },
    play: function ()
    {
        var state = this._state;

        if (state.is('play')) return;

        state.play();

        var startTime = now(),
            duration = this._duration,
            target = this._target,
            self = this;

        function render()
        {
            if (state.is('pause')) return;

            var time = now();

            self.progress((time - startTime) / duration);

            if (self._progress === 1)
            {
                self.emit('end', target);
                return;
            }

            raf(render);
        }

        raf(render);

        return this;
    },
    pause: function ()
    {
        var state = this._state;

        if (state.is('pause')) return;
        state.pause();

        return this;
    }
});