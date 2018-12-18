/*
 * @Author: fan.li
 * @Date: 2018-07-27 14:25:18
 * @Last Modified by: fan.li
 * @Last Modified time: 2018-12-17 18:05:53
 *
 *  主页，登录页
 */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Radio, message, Spin } from 'antd';
import { bindActionCreators } from 'redux';

import logo from '../../assets/images/logo.png';
import { connect } from 'react-redux';

import TitleBar from '../commons/TitleBar';
import styles from './style.scss';
import { isEmpty } from '../../utils/utils';
import YIMClient from '../../utils/client';
import * as actions from '../../actions/app';

const { Group: RadioGroup } = Radio;

type State = {
  role: 0 | 1,   // 0: teacher 1: student;
  name: string,
  room: string,
  isLoading: boolean,
};

class Index extends React.Component<null, State> {
  constructor(props) {
    super(props);
    this.state = {
      role: 0,
      name: '',
      room: '',
      isLogining: false
    };
  }

  handleSubmit = async () => {
    try {
      this.setState({ isLogining: true });
      const { role, name, room } = this.state;
      const { setRoom, setNickname, setRole, addOneUser, history } = this.props;

      if (isEmpty(name) || isEmpty(room)) {
        return message.warn("username and roomname not allow empty");
      }

      // login
      await YIMClient.instance.login(name).catch((code) => {
        message.error(`login fail! code=${code}`);
      });

      // join chat room
      await YIMClient.instance.joinRoom(room).catch(code => {
        message.error(`join room error, code=${code}`);
      });

      // save room and nickname into redux
      setRoom(room);
      setNickname(name);
      setRole(role);
      addOneUser({ name, role });
      message.info('login success!');
      this.setState({ isLoading: false });

      history.push('/devicecheck');
    } catch(err) {
      this.setState({ isLoading: false });
      message.error('unknow error!!' + err);
    }
  }

  onInputChange = (e) => {
    const name = e.target.name;
    this.setState({ [name]: e.target.value });
  }

  onRadioChange = (e) => {
    this.setState({ role: e.target.value });
  }

  render() {
    const { isLogining } = this.state;

    return (
      <div className={styles.container}>
        <TitleBar />
        <main className={styles.content}>
          { isLogining ? ( <Spin className={styles.spin} size="large" />) : (null) }
          <img src={logo} alt="youme tech logo" className={styles.logo} />
          <h1 className={styles.title}>LOGO IN</h1>

          <section className={styles.form}>
            <input
              name="name"
              className={styles.form__input}
              placeholder="N A M E"
              onChange={this.onInputChange}
            />
            <input
              name="room"
              className={styles.form__input}
              placeholder="R O O M"
              onChange={this.onInputChange}
            />
          </section>

          <RadioGroup
            className={styles.roles}
            value={this.state.role}
            onChange={this.onRadioChange}
          >
            <Radio className={styles.roles_radio} value={0}>Teacher</Radio>
            <Radio className={styles.roles_radio} value={1}>Student</Radio>
          </RadioGroup>

          <section style={{ marginTop: '3%' }}>
            <button
              className={styles.submit_btn}
              onClick={this.handleSubmit}
            >
              Join
            </button>
          </section>
        </main>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setRoom: bindActionCreators(actions.setRoom, dispatch),
    setNickname: bindActionCreators(actions.setNickname, dispatch),
    setRole: bindActionCreators(actions.setRole, dispatch),
    addOneUser: bindActionCreators(actions.addOneUser, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(Index);
