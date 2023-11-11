import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit, useForwardRef, useListeners } from '@oku-ui/use-composable'
import { OkuMenuRadioItem } from '@oku-ui/menu'
import { MENUBAR_RADIO_ITEM_NAME, menubarRadioItemProps, scopedMenubarProps, useMenuScope } from './props'
import type { MenubarRadioItemNativeElement } from './props'

const menubarRadioItem = defineComponent({
  name: MENUBAR_RADIO_ITEM_NAME,
  components: {
    OkuMenuRadioItem,
  },
  inheritAttrs: false,
  props: {
    ...menubarRadioItemProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarRadioItemProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...radioItemProps
    } = toRefs(props)

    const _other = reactive(radioItemProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const forwardedRef = useForwardRef()
    const emits = useListeners()

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuRadioItem, {
      ...menuScope,
      ...mergeProps(attrs, otherProps, emits),
      ref: forwardedRef,
    }, slots)
  },
})

// TODO: https://github.com/vuejs/core/pull/7444 after delete
export const OkuMenubarRadioItem = menubarRadioItem as typeof menubarRadioItem &
(new () => { $props: MenubarRadioItemNativeElement })
