import { computed, CSSProperties, PropType } from 'vue'
import { createNameSpace } from '../utils'
import { NormalTypes } from '../utils/theme/propTypes'
import './tag.less'

const [createComponent] = createNameSpace('Tag')

interface Icolor {
  color: string
}

const queryColors = (type: NormalTypes, invert: boolean) => {
  const colors: { [key in NormalTypes]: Icolor } = {
    default: {
      color: 'var(--primary-foreground)',
    },
    success: {
      color: 'var(--success-default)',
    },
    warning: {
      color: 'var(--warning-default)',
    },
    error: {
      color: 'var(--error-default)',
    },
  }
  const hideBorder = invert

  const invertColor = (hideBorder: boolean) => {
    if (hideBorder) {
      const style: CSSProperties = {
        color: 'var(--primary-background)',
      }
      return style
    }
    return colors[type]
  }

  /**
   * use hideBorder to control backgroundColor and borderColor
   * when hideBorder value as true .It means should set default style Or it means should
   * set invert style.
   *
   */
  const tagStyle = {
    ...invertColor(hideBorder),
    bgColor: hideBorder ? colors[type].color : 'var(--primary-background)',
    borderColor: hideBorder ? 'transparent' : colors[type].color,
  }

  return tagStyle
}

export default createComponent({
  props: {
    text: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String as PropType<NormalTypes>,
      default: 'default',
    },
    useInvert: Boolean,
  },
  setup(props) {
    const setTagStyle = computed(() => {
      const { type, useInvert } = props
      const { color, bgColor, borderColor } = queryColors(type, useInvert)
      const style: CSSProperties = {
        borderColor,
        color: color,
        backgroundColor: bgColor,
      }
      return style
    })

    return () => (
      <div class="fect-tag" style={setTagStyle.value}>
        {props.text}
      </div>
    )
  },
})
