import { createProvide } from '@oku-ui/provide'
import { defineComponent, h } from 'vue'

const DIRECTION_NAME = 'OkuDirection'

type Direction = 'ltr' | 'rtl'
type DirectionProvideValue = { dir: Direction }

const [DirectionProvider, useDirectionContext] = createProvide<DirectionProvideValue>(DIRECTION_NAME)

/* -------------------------------------------------------------------------------------------------
 * Direction
 * ----------------------------------------------------------------------------------------------- */

const OkuDirection = defineComponent({
  name: DIRECTION_NAME,
  inheritAttrs: false,
  props: {
    dir: {
      type: String as () => Direction,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const dir = props.dir

    return () => h(DirectionProvider, { dir, ...attrs }, {
      default: () => slots.default?.(),
    })
  },
})

/* ----------------------------------------------------------------------------------------------- */

function useDirection(localDir?: Direction) {
  const globalDir = useDirectionContext(DIRECTION_NAME)
  return localDir || globalDir || 'ltr'
}

const Provider = DirectionProvider

export { useDirection, Provider, OkuDirection }
