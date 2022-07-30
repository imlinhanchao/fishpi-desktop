<template>
    <audio :title="source.name" :src="source.url" crossorigin playsinline autoplay controls>
    </audio>
</template>
<script>
	import Plyr from 'plyr'
	import 'plyr/dist/plyr.css'

	export default {
		name: 'Player',
		props: {
			/** Options object for plyr config. **/
			options: {
				type: Object,
				required: false,
				default() {
					return {}
				}
			},
            source: {
                type: Object,
                required: true,
            }
		},
        watch: {
            source() {
                this.player.stop();
                this.player = new Plyr(this.$el, this.opts)
            }
        },
		data() {
			return {
				player: {}
			}
		},
		computed: {
			opts() {
				const options = this.options
				if (
					!Object.prototype.hasOwnProperty.call(
						this.options,
						'hideYouTubeDOMError'
					)
				) {
					options.hideYouTubeDOMError = true
				}
				return options
			}
		},
		mounted() {
			this.player = new Plyr(this.$el, this.opts)
            this.player.on('ended', (event) => {
                this.$emit('ended');
            });
		},
		beforeUnmount() {
			try {
				this.player.destroy()
			} catch (e) {
				if (
					!(
						this.opts.hideYouTubeDOMError &&
						e.message === 'The YouTube player is not attached to the DOM.'
					)
				) {
					// eslint-disable-next-line no-console
					console.error(e)
				}
			}
		}
	}
</script>
