import { useRouter } from 'next/router';
import React from 'react';
import { useSelector } from 'react-redux';
import useBoolean from '../../hooks/useBoolean';
import PopUpContainer from '../common/PopupContainer';
import CommentList from './CommentList';
import CommentsWrite from './CommentWrite';
import useCommentRepliesWrite from './hooks/useCommentRepliesWrite';
import useDeleteComment from './hooks/useDeleteSub';

export type CommentRepliesProps = {
  id: string;
  onToggleOpen: () => void;
  isMine: boolean;
  open: boolean;
};

function CommentReplies({ id, onToggleOpen, isMine, open }: CommentRepliesProps) {
  const router = useRouter();

  const { onWrite, comment, onChange, replies, writing, onToggle } =
    useCommentRepliesWrite(router.query.id, id);

  const { onRemove, askRemove, onConfirmRemove, onToggleAskRemove } =
    useDeleteComment(id);

  const { auth } = useSelector((state: any) => state.auth);

  const onCancel = () => {
    onToggleOpen();
  };

  if (replies.loading || !replies.data) {
    return null;
  }

  return (
    <div>
      {open ? (
        <div className="mt-4 ml-12">
          <CommentsWrite
            comment={comment}
            onWrite={onWrite}
            onChange={onChange}
            onCancel={onCancel}
          />
        </div>
      ) : (
        ''
      )}

      <div className="ml-10 mxs:ml-6">
        <CommentList
          comments={replies?.data?.getSub?.replies}
          onRemove={onRemove}
          isMine={isMine}
          currentId={auth?.id}
        />
      </div>

      <PopUpContainer
        visible={askRemove}
        title="댓글 삭제"
        onConfirm={onConfirmRemove}
        onCancel={onToggleAskRemove}>
        댓글을 삭제하시겠습니까?
      </PopUpContainer>
    </div>
  );
}

export default React.memo(CommentReplies);
