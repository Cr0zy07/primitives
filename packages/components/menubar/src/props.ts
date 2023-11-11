import type { PropType, Ref } from 'vue'
import { primitiveProps, propsOmit } from '@oku-ui/primitive'
import type { OkuElement, PrimitiveProps } from '@oku-ui/primitive'
import { ScopePropObject, createProvideScope } from '@oku-ui/provide'
import type { Scope } from '@oku-ui/provide'
import type { Direction } from '@oku-ui/direction'
import { createMenuScope, menuArrowProps, menuCheckboxItemProps, menuContentProps, menuGroupProps, menuItemIndicatorProps, menuItemProps, menuLabelProps, menuPortalProps, menuRadioGroupProps, menuRadioItemProps, menuSeparatorProps, menuSubContentProps, menuSubTriggerProps } from '@oku-ui/menu'
import type { MenuArrowElement, MenuArrowNativeElement, MenuArrowProps, MenuCheckboxItemElement, MenuCheckboxItemEmits, MenuCheckboxItemNativeElement, MenuCheckboxItemProps, MenuContentElement, MenuContentNativeElement, MenuContentProps, MenuGroupElement, MenuGroupNativeElement, MenuGroupProps, MenuItemElement, MenuItemEmits, MenuItemIndicatorElement, MenuItemIndicatorNativeElement, MenuItemIndicatorProps, MenuItemNativeElement, MenuItemProps, MenuLabelElement, MenuLabelNativeElement, MenuLabelProps, MenuPortalProps, MenuRadioGroupElement, MenuRadioGroupNativeElement, MenuRadioGroupProps, MenuRadioItemElement, MenuRadioItemEmits, MenuRadioItemNativeElement, MenuRadioItemProps, MenuSeparatorElement, MenuSeparatorNativeElement, MenuSeparatorProps, MenuSubContentElement, MenuSubContentEmits, MenuSubContentNativeElement, MenuSubContentProps, MenuSubTriggerElement, MenuSubTriggerEmits, MenuSubTriggerNativeElement, MenuSubTriggerProps } from '@oku-ui/menu'
import { createRovingFocusGroupScope } from '@oku-ui/roving-focus'
import type { RovingFocusGroupProps } from '@oku-ui/roving-focus'
import { createCollection } from '@oku-ui/collection'
import type { DismissableLayerEmits } from '@oku-ui/Dismissable-layer'
import type { FocusScopeEmits } from '@oku-ui/focus-scope'

export type ScopedMenubar<P> = P & { scopeOkuMenubar?: Scope }

export const scopedMenubarProps = {
  scopeOkuMenubar: {
    ...ScopePropObject,
  },
}

// NAMES
export const MENUBAR_NAME = 'OkuMenubar'
export const MENUBAR_MENU_NAME = 'OkuMenubarMenu'
export const MENUBAR_TRIGGER_NAME = 'OkuMenubarTrigger'
export const MENUBAR_PORTAL_NAME = 'OkuMenubarPortal'
export const MENUBAR_CONTENT_NAME = 'OkuMenubarContent'
export const MENUBAR_GROUP_NAME = 'OkuMenubarGroup'
export const MENUBAR_LABEL_NAME = 'OkuMenubarLabel'
export const MENUBAR_ITEM_NAME = 'OkuMenubarItem'
export const MENUBAR_CHECKBOX_ITEM_NAME = 'OkuMenubarCheckboxItem'
export const MENUBAR_RADIO_GROUP_NAME = 'OkuMenubarRadioGroup'
export const MENUBAR_RADIO_ITEM_NAME = 'OkuMenubarRadioItem'
export const MENUBAR_ITEM_INDICATOR_NAME = 'OkuMenubarItemIndicator'
export const MENUBAR_SEPARATOR_NAME = 'OkuMenubarSeparator'
export const MENUBAR_ARROW_NAME = 'OkuMenubarArrow'
export const MENUBAR_SUB_NAME = 'OkuMenubarSub'
export const MENUBAR_SUB_TRIGGER_NAME = 'OkuMenubarSubTrigger'
export const MENUBAR_SUB_CONTENT_NAME = 'OkuMenubarSubContent'

/* -------------------------------------------------------------------------------------------------
 * Menubar - menubar.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarNativeElement = OkuElement<'div'>
export type MenubarElement = HTMLDivElement

type ItemData = { value: string; disabled: boolean }

export const { CollectionProvider, CollectionSlot, CollectionItemSlot, useCollection, createCollectionScope } = createCollection<MenubarTriggerElement, ItemData>(MENUBAR_NAME)

export const useMenuScope = createMenuScope()
export const useRovingFocusGroupScope = createRovingFocusGroupScope()

export const [createMenubarProvide, createMenubarScope] = createProvideScope(MENUBAR_NAME, [
  createCollectionScope,
  createRovingFocusGroupScope,
])

export type MenubarInjectValue = {
  value: Ref<string | boolean>
  dir: Ref<Direction>
  loop: Ref<boolean | undefined>
  onMenuOpen(value: string): void
  onMenuClose(): void
  onMenuToggle(value: string): void
}

export const [menubarProvider, useMenubarInject]
  = createMenubarProvide<MenubarInjectValue>(MENUBAR_NAME)

export interface MenubarProps extends PrimitiveProps {
  value?: string | boolean
  defaultValue?: string
  modelValue?: boolean
  loop?: RovingFocusGroupProps['loop']
  dir?: RovingFocusGroupProps['dir']
}

export const menubarProps = {
  props: {
    value: {
      type: [String, Boolean] as PropType<MenubarProps['value']>,
      default: undefined,
    },
    defaultValue: {
      type: String as PropType<MenubarProps['defaultValue']>,
      default: undefined,
    },
    modelValue: {
      type: Boolean as PropType<MenubarProps['modelValue']>,
      default: undefined,
    },
    loop: {
      type: Boolean as PropType<MenubarProps['loop']>,
      default: true,
    },
    dir: {
      type: String as PropType<MenubarProps['dir']>,
    },
    ...primitiveProps,
  },
  emits: {
    // eslint-disable-next-line unused-imports/no-unused-vars
    'valueChange': (value: boolean) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    'update:modelValue': (value: MenubarSubEmits['update:modelValue'][0]) => true,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarMenu - menubar-menu.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarMenuInjectValue = {
  value: Ref<string>
  triggerId: Ref<string>
  triggerRef: Ref<MenubarTriggerElement | null>
  contentId: Ref<string>
  wasKeyboardTriggerOpenRef: Ref<boolean>
}

export const [menubarMenuProvider, useMenubarMenuInject]
  = createMenubarProvide<MenubarMenuInjectValue>(MENUBAR_MENU_NAME)

export interface MenubarMenuProps {
  value?: string
}

export const menubarMenuProps = {
  props: {
    value: {
      type: String as PropType<MenubarMenuProps['value']>,
    },
  },
  emits: { },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarTrigger - menubar-trigger.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarTriggerNativeElement = OkuElement<'button'>
export type MenubarTriggerElement = HTMLButtonElement

export interface MenubarTriggerProps extends PrimitiveProps {
  disabled?: boolean
}

export type MenubarTriggerEmits = {
  pointerdown: [event: PointerEvent]
  pointerenter: [event: PointerEvent]
  keydown: [event: KeyboardEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

export const menubarTriggerProps = {
  props: {
    disabled: {
      type: Boolean as PropType<MenubarTriggerProps['disabled']>,
      default: false,
    },
    ...primitiveProps,
  },
  emits: {
    // eslint-disable-next-line unused-imports/no-unused-vars
    pointerdown: (event: MenubarTriggerEmits['pointerdown'][0]) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    pointerenter: (event: MenubarTriggerEmits['pointerenter'][0]) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    keydown: (event: MenubarTriggerEmits['keydown'][0]) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    focus: (event: MenubarTriggerEmits['focus'][0]) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    blur: (event: MenubarTriggerEmits['blur'][0]) => true,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarPortal - menubar-portal.ts
 * ----------------------------------------------------------------------------------------------- */

export interface MenubarPortalProps extends MenuPortalProps { }

export const menubarPortalProps = {
  props: {
    ...menuPortalProps.props,
  },
  emits: {
    ...menuPortalProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarContent - menubar-content.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarContentNativeElement = MenuContentNativeElement
export type MenubarContentElement = MenuContentElement

export interface MenubarContentProps extends MenuContentProps { }

export type MenubarContentEmits = {
  closeAutoFocus: [event: FocusScopeEmits['unmountAutoFocus'][0]]
  focusOutside: [event: DismissableLayerEmits['focusOutside'][0]]
  interactOutside: [event: DismissableLayerEmits['interactOutside'][0]]
  keydown: [event: KeyboardEvent]
}

export const menubarContentProps = {
  props: {
    ...propsOmit(menuContentProps.props, ['align']),
    align: {
      ...menuContentProps.props.align,
      default: 'start',
    },
  },
  emits: {
    ...propsOmit(menuContentProps.emits, ['entryFocus']),
    // // eslint-disable-next-line unused-imports/no-unused-vars
    // closeAutoFocus: (event: MenubarContentEmits['closeAutoFocus'][0]) => true,
    // // eslint-disable-next-line unused-imports/no-unused-vars
    // focusOutside: (event: MenubarContentEmits['focusOutside'][0]) => true,
    // // eslint-disable-next-line unused-imports/no-unused-vars
    // interactOutside: (event: MenubarContentEmits['interactOutside'][0]) => true,
    // // eslint-disable-next-line unused-imports/no-unused-vars
    // keydown: (event: MenubarContentEmits['keydown'][0]) => true,
  },

}

/* -------------------------------------------------------------------------------------------------
 * MenubarGroup - menubar-group.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarGroupNativeElement = MenuGroupNativeElement
export type MenubarGroupElement = MenuGroupElement

export interface MenubarGroupProps extends MenuGroupProps { }

export const menubarGroupProps = {
  props: {
    ...menuGroupProps.props,
  },
  emits: {
    ...menuGroupProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarLabel - menubar-label.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarLabelNativeElement = MenuLabelNativeElement
export type MenubarLabelElement = MenuLabelElement

export interface MenubarLabelProps extends MenuLabelProps { }

export const menubarLabelProps = {
  props: {
    ...menuLabelProps.props,
  },
  emits: {
    ...menuLabelProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarItem - menubar-item.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarItemNativeElement = MenuItemNativeElement
export type MenubarItemElement = MenuItemElement

export interface MenubarItemProps extends MenuItemProps { }

export interface MenubarItemEmits extends MenuItemEmits { }

export const menubarItemProps = {
  props: {
    ...menuItemProps.props,
  },
  emits: {
    ...menuItemProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarCheckboxItem - menubar-Checkbox-item.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarCheckboxItemNativeElement = MenuCheckboxItemNativeElement
export type MenubarCheckboxItemElement = MenuCheckboxItemElement

export interface MenubarCheckboxItemProps extends MenuCheckboxItemProps { }

export interface MenubarCheckboxItemEmits extends MenuCheckboxItemEmits { }

export const menubarCheckboxItemProps = {
  props: {
    ...menuCheckboxItemProps.props,
  },
  emits: {
    ...menuCheckboxItemProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioGroup - menubar-radio-group.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarRadioGroupNativeElement = MenuRadioGroupNativeElement
export type MenubarRadioGroupElement = MenuRadioGroupElement

export interface MenubarRadioGroupProps extends MenuRadioGroupProps { }

export const menubarRadioGroupProps = {
  props: {
    ...menuRadioGroupProps.props,
  },
  emits: {
    ...menuRadioGroupProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarRadioItem - menubar-radio-item.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarRadioItemNativeElement = MenuRadioItemNativeElement
export type MenubarRadioItemElement = MenuRadioItemElement

export interface MenubarRadioItemProps extends MenuRadioItemProps { }

export interface MenubarRadioItemEmits extends MenuRadioItemEmits { }

export const menubarRadioItemProps = {
  props: {
    ...menuRadioItemProps.props,
  },
  emits: {
    ...menuRadioItemProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarItemIndicator - menubar--item-indicator.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarItemIndicatorNativeElement = MenuItemIndicatorNativeElement
export type MenubarItemIndicatorElement = MenuItemIndicatorElement

export interface MenubarItemIndicatorProps extends MenuItemIndicatorProps { }

export const menubarItemIndicatorProps = {
  props: {
    ...menuItemIndicatorProps.props,
  },
  emits: {
    ...menuItemIndicatorProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarSeparator - menubar-separator.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarSeparatorNativeElement = MenuSeparatorNativeElement
export type MenubarSeparatorElement = MenuSeparatorElement

export interface MenubarSeparatorProps extends MenuSeparatorProps { }

export const menubarSeparatorProps = {
  props: {
    ...menuSeparatorProps.props,
  },
  emits: {
    ...menuSeparatorProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarArrow - menubar-arrow.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarArrowNativeElement = MenuArrowNativeElement
export type MenubarArrowElement = MenuArrowElement

export interface MenubarArrowProps extends MenuArrowProps { }

export const menubarArrowProps = {
  props: {
    ...menuArrowProps.props,
  },
  emits: {
    ...menuArrowProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarSub - menubar-sub.ts
 * ----------------------------------------------------------------------------------------------- */

export interface MenubarSubProps {
  open?: boolean
  defaultOpen?: boolean
  modelValue?: boolean
}

export type MenubarSubEmits = {
  openChange: [open: boolean]
  'update:modelValue': [open: boolean]
}

export const menubarSubProps = {
  props: {
    open: {
      type: Boolean as PropType<MenubarSubProps['open']>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<MenubarSubProps['defaultOpen']>,
      default: undefined,
    },
    modelValue: {
      type: Boolean as PropType<MenubarSubProps['modelValue']>,
      default: undefined,
    },
  },
  emits: {
    // eslint-disable-next-line unused-imports/no-unused-vars
    'openChange': (open: MenubarSubEmits['openChange'][0]) => true,
    // eslint-disable-next-line unused-imports/no-unused-vars
    'update:modelValue': (open: MenubarSubEmits['update:modelValue'][0]) => true,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarSubTrigger - menubar-sub-trigger.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarSubTriggerNativeElement = MenuSubTriggerNativeElement
export type MenubarSubTriggerElement = MenuSubTriggerElement

export interface MenubarSubTriggerProps extends MenuSubTriggerProps { }

export interface MenubarSubTriggerEmits extends MenuSubTriggerEmits { }

export const menubarSubTriggerProps = {
  props: {
    ...menuSubTriggerProps.props,
  },
  emits: {
    ...menuSubTriggerProps.emits,
  },
}

/* -------------------------------------------------------------------------------------------------
 * MenubarSubContent - menubar-sub-content.ts
 * ----------------------------------------------------------------------------------------------- */

export type MenubarSubContentNativeElement = MenuSubContentNativeElement
export type MenubarSubContentElement = MenuSubContentElement

export interface MenubarSubContentProps extends MenuSubContentProps { }

export interface MenubarSubContentEmits extends MenuSubContentEmits { }

export const menubarSubContentProps = {
  props: {
    ...menuSubContentProps.props,
  },
  emits: {
    ...menuSubContentProps.emits,
  },
}
