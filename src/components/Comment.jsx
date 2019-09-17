import React, { Component } from 'react';
import ProfileHover from 'profile-hover';
import Linkify from 'react-linkify';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';

import { timeSince, shortenEthAddr } from '../utils';
import Delete from '../assets/Delete.svg';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Comment.scss';

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingDelete: false
    };
  }

  deleteComment = async (commentId, e) => {
    e.preventDefault();
    const { thread, joinThread } = this.props;

    // if user hasn't joined thread yet
    if (!Object.keys(thread).length) {
      this.setState({ loadingDelete: true });
      await joinThread();
    }

    try {
      await this.props.thread.deletePost(commentId);
      this.setState({ loadingDelete: false });
    } catch (error) {
      console.error('There was an error deleting your comment', error);
    }
  }

  render() {
    const { loadingDelete } = this.state;
    const {
      comment,
      profile,
      isMyComment,
      useHovers,
      isOwner,
      isAdmin,
      userProfileURL
    } = this.props;
    const profilePicture = profile.ethAddr &&
      (profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
        : makeBlockie(profile.ethAddr));
    const canDelete = isMyComment || isOwner;

    return (
      <div className={`comment ${canDelete ? 'isMyComment' : ''}`}>
        <a
          href={profile.profileURL ? `${profile.profileURL}` : `https://3box.io/${profile.ethAddr}`}
          target={profile.profileURL ? '_self' : '_blank'}
          rel={profile.profileURL ? 'dofollow' : 'noopener noreferrer'}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="profile"
              className="comment_picture comment_picture-bgWhite"
            />
          ) : <div className="comment_picture" />}
        </a>

        <div className="comment_content">
          <div className="comment_content_context">
            <div className="comment_content_context_main">
              <a
                href={profile.profileURL ? profile.profileURL : `https://3box.io/${profile.ethAddr}`}
                className="comment_content_context_main_user"
                target={profile.profileURL ? '_self' : '_blank'}
                rel={profile.profileURL ? 'dofollow' : 'noopener noreferrer'}
              >
                <div className="comment_content_context_main_user_info">
                  {useHovers ? (
                    <ProfileHover
                      address={profile && profile.ethAddr}
                      orientation="right"
                      noTheme
                    >
                      <div className="comment_content_context_main_user_info_username">
                        {profile.name || shortenEthAddr(profile.ethAddr)}
                      </div>
                    </ProfileHover>
                  ) : (
                      <div className="comment_content_context_main_user_info_username">
                        {profile.name || shortenEthAddr(profile.ethAddr)}
                      </div>
                    )}

                  {profile.name && (
                    <div
                      className="comment_content_context_main_user_info_address"
                      title={profile.ethAddr}
                    >
                      {profile.ethAddr && `${shortenEthAddr(profile.ethAddr)} ${isAdmin ? 'ADMIN' : ''}`}
                    </div>
                  )}
                </div>

                {loadingDelete && <SVG className="comment_loading" src={Loading} alt="Loading" />}
                {(!loadingDelete && profile.ethAddr) && (
                  <div className="comment_content_context_main_user_delete">
                    <button
                      onClick={(e) => this.deleteComment(comment.postId, e)}
                      className="comment_content_context_main_user_delete_button"
                    >
                      <SVG src={Delete} alt="Delete" className="comment_content_context_main_user_delete_button_icon" />
                    </button>
                  </div>
                )}
              </a>

            </div>

            <div className="comment_content_context_time">
              {`${timeSince(comment.timestamp * 1000)} ago`}
            </div>
          </div>
          <div className="comment_content_text">
            <Linkify>
              {comment.message}
            </Linkify>
          </div>
        </div >
      </div >
    );
  }
}

export default Comment;