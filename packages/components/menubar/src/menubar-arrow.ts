import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef } from '@oku-ui/use-composable'
import { OkuMenuArrow } from '@oku-ui/menu'
import { MENUBAR_ARROW_NAME, menubarArrowProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarArrowNativeElement } from './props'

const menubarArrow = defineComponent({
  name: MENUBAR_ARROW_NAME,
  components: {
    OkuMenuArrow,
  },
  inheritAttrs: false,
  props: {
    ...menubarArrowProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarArrowProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...arrowProps
    } = toRefs(props)

    const _other = reactive(arrowProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuArrow, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarArrow = menubarArrow as typeof menubarArrow &
(new () => { $props: MenubarArrowNativeElement })
