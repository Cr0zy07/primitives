import { defineComponent, h, mergeProps, reactive, toRefs } from 'vue'
import { reactiveOmit } from '@oku-ui/use-composable'
import { OkuMenuPortal } from '@oku-ui/menu'
import { MENUBAR_PORTAL_NAME, menubarPortalProps, scopedMenubarProps, useMenuScope } from './props'

const menubarPortal = defineComponent({
  name: MENUBAR_PORTAL_NAME,
  components: {
    OkuMenuPortal,
  },
  inheritAttrs: false,
  props: {
    ...menubarPortalProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarPortalProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      ...portalProps
    } = toRefs(props)

    const _other = reactive(portalProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const menuScope = useMenuScope(scopeOkuMenubar.value)

    return () => h(OkuMenuPortal, {
      ...menuScope,
      ...mergeProps(attrs, otherProps),
    }, slots)
  },
})

export const OkuMenubarPortal = menubarPortal
