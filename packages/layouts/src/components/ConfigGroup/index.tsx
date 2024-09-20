import React from 'react'
import { Icon, Switch } from 'ink'
import './index.less'

type State = {
  checked: boolean
  isFolded: boolean
}

type Props = {
  /** 配置标题内容 */
  title: React.ReactNode
  /** 是否显示配置开关 */
  showSwitch?: boolean
  /** 是否禁用配置开关 */
  disabled?: boolean
  /** 配置是否为开启状态（默认为true），仅当showSwitch为true时有意义 */
  checked?: boolean
  /** 点击配置栏是否可切换展开收起状态，默认为true */
  toggle?: boolean
  /** 开启/关闭配置时回调，仅当showSwitch为true时有意义 */
  onUpdateChecked?(checked: boolean): void
  customClass?: string
  bodyStyle?: React.CSSProperties
}

class ConfigGroup extends React.PureComponent<Props, State> {
  bodyRef: HTMLDivElement | null = null

  constructor(props: Props) {
    super(props)

    const { checked = true } = props

    this.state = {
      checked,
      isFolded: !checked,
    }
  }

  togglePanel = () => {
    const { toggle = true } = this.props
    const { isFolded, checked } = this.state
    if (!toggle || !checked) {
      return
    }

    this.setState({
      isFolded: !isFolded,
    })
  }

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    const { isFolded } = this.state

    if (isFolded !== prevState.isFolded && prevState.isFolded) {
      if (this.bodyRef != null && typeof this.bodyRef['scrollIntoViewIfNeeded'] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.bodyRef['scrollIntoViewIfNeeded'](false)
      }
    }
  }

  // 接口慢的时候会导致切换效果慢，需要实时更新Switch状态
  onSwitchChange = (checked: boolean) => {
    const { onUpdateChecked } = this.props

    this.setState({
      checked,
      isFolded: !checked,
    })
    // 等待switch 动画执行完
    if (onUpdateChecked) {
      setTimeout(() => {
        onUpdateChecked(checked)
      }, 366)
    }
  }

  render() {
    const {
      title = '',
      customClass = '',
      showSwitch,
      disabled,
      children,
      bodyStyle,
      toggle = true,
    } = this.props
    const { isFolded, checked } = this.state

    return (
      <div className={`config-group ${customClass} ${!isFolded && toggle ? 'open' : 'close'}`}>
        <h3 className="config-group__title" onClick={this.togglePanel}>
          {showSwitch && (
            <Switch
              size="small"
              className="custom-switch"
              checked={checked}
              disabled={disabled}
              onClick={(checked, ev) => ev.stopPropagation()}
              onChange={this.onSwitchChange}
            />
          )}
          <div className="title-label">{title}</div>
          {checked && toggle && (
            <div className="icon-box">
              <Icon name="arrow-right" className={isFolded ? '' : 'unfold'} />
            </div>
          )}
        </h3>
        {!isFolded && checked && (
          <div
            className="config-group__body"
            ref={(ref) => (this.bodyRef = ref)}
            style={{ ...bodyStyle }}
          >
            {children}
          </div>
        )}
      </div>
    )
  }
}

export default ConfigGroup
