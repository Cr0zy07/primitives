import { computed, defineComponent, h, mergeProps, onMounted, reactive, ref, toRefs } from 'vue'
import { OkuMenu } from '@oku-ui/menu'
import { reactiveOmit, useId } from '@oku-ui/use-composable'
import type { MenubarTriggerElement } from './props'
import { MENUBAR_MENU_NAME, menubarMenuProps, menubarMenuProvider, scopedMenubarProps, useMenuScope, useMenubarInject } from './props'

const menubarMenu = defineComponent({
  name: MENUBAR_MENU_NAME,
  components: {
    OkuMenu,
  },
  inheritAttrs: false,
  props: {
    ...menubarMenuProps.props,
    ...scopedMenubarProps,
  },
  emits: menubarMenuProps.emits,
  setup(props, { attrs, slots }) {
    const {
      scopeOkuMenubar,
      value: valueProp,
      ...menuProps
    } = toRefs(props)

    const _other = reactive(menuProps)
    const otherProps = reactiveOmit(_other, (key, _value) => key === undefined)

    const autoValue = useId()
    // We need to provide an initial deterministic value as `useId` will return
    // empty string on the first render and we don't want to match our internal "closed" value.
    const value = computed(() => valueProp.value || autoValue || 'LEGACY_REACT_AUTO_VALUE')
    const inject = useMenubarInject(MENUBAR_MENU_NAME, scopeOkuMenubar.value)
    const menuScope = useMenuScope(scopeOkuMenubar.value)
    const triggerRef = ref<MenubarTriggerElement | null>(null)
    const wasKeyboardTriggerOpenRef = ref(false)
    const open = inject.value.value === value.value

    onMounted(() => {
      if (!open)
        wasKeyboardTriggerOpenRef.value = false
    })

    menubarMenuProvider({
      scope: scopeOkuMenubar.value,
      value,
      triggerId: computed(() => useId()),
      triggerRef,
      contentId: computed(() => useId()),
      wasKeyboardTriggerOpenRef,
    })

    return () => h(OkuMenu, {
      ...attrs,
      ...menuScope,
      open,
      onOpenChange: (_open) => {
        // Menu only calls `onOpenChange` when dismissing so we
        // want to close our MenuBar based on the same events.
        if (!_open)
          inject.onMenuClose()
      },
      modal: false,
      dir: inject.dir.value,
      ...mergeProps(attrs, otherProps),
    }, slots)
  },
})

export const OkuMenubarMenu = menubarMenu
