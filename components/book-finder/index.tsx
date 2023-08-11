'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../store/rootReducer';
import { MdClose } from 'react-icons/md';
import {
  getBookInfoSuccess,
  getPostBody,
  getPostId,
  getPostTags,
  getPostTitle,
  getThumbnail,
} from '../../store/book';
import { toast } from 'react-toastify';
import { IoSearchOutline } from 'react-icons/io5';
import BookContext from '@/context/book-context';
import ModalContext from '@/context/modal-context';
import { ArrowLink, NextLink } from '../arrow-button';
import BooksTableContainer from './table-container';

function BooksTableForm({
  BookName: externalBookName,
  initialBookName = externalBookName || '',
  onSubmit,
  BookIsClose,
  SetBookIsClose,
}: any) {
  const [BookName, setBookName] = React.useState(initialBookName);

  React.useEffect(() => {
    if (typeof externalBookName === 'string') {
      setBookName(externalBookName);
    }
  }, [externalBookName]);

  function handleChange(e: { target: { value: any } }) {
    setBookName(e.target.value);
  }

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    onSubmit(BookName);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex w-full items-center justify-between">
        <div className="bg-[rgb(255 115 179)] absolute left-[16px] top-[50%] translate-y-[-50%] dark:text-[#e4e5e7]">
          <IoSearchOutline />
        </div>
        <input
          onChange={handleChange}
          value={BookName}
          placeholder="책을 검색해 보세요"
          name="BookName"
          className=" h-[50px] w-[310px] rounded-full border-[1px] border-[#d8dae5] px-[2.5rem] py-[0.5rem] text-xs text-[#474d66] focus:outline-none dark:border-[#1a1b1e] dark:bg-[#2b2d31] dark:text-[#e4e5e7] dark:placeholder-gray-300"
          style={{ borderRadius: '1.5rem', fontSize: '12px' }}
        />
        <MdClose
          onClick={() => SetBookIsClose(!BookIsClose)}
          tabIndex={1}
          size={24}
          color="#868E96"
          className="cursor-pointer sm:hidden"
        />
      </div>
    </form>
  );
}

function useBookCache() {
  const context = React.useContext(BookContext);
  if (!context) {
    throw new Error('useBookCache must be used within a BookCacheProvider');
  }
  return context;
}

function useSafeDispatch(dispatch: any) {
  const mounted = React.useRef(false);

  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return React.useCallback(
    (...args: any) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch],
  );
}

function asyncReducer(state: any, action: any) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null };
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null };
    }
    case 'rejected': {
      return { status: 'rejected', data: null, error: action.error };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function useAsync(initialState: any) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  });

  const dispatch = useSafeDispatch(unsafeDispatch);

  const { data, error, status } = state;

  const run = React.useCallback(
    (promise: any) => {
      dispatch({ type: 'pending' });
      promise.then(
        (data: any) => {
          dispatch({ type: 'resolved', data });
        },
        (error: any) => {
          dispatch({ type: 'rejected', error });
        },
      );
    },
    [dispatch],
  );

  const setData = React.useCallback(
    (data: any) => dispatch({ type: 'resolved', data }),
    [dispatch],
  );
  const setError = React.useCallback(
    (error: any) => dispatch({ type: 'rejected', error }),
    [dispatch],
  );

  return {
    setData,
    setError,
    error,
    status,
    data,
    run,
  };
}

export const bookApi = (title: any) => {
  return axios
    .request({
      method: 'get',
      url: `https://dapi.kakao.com/v3/search/book?target=title&query=${title}&size=50&sort=accuracy`,
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO}`,
      },
    })
    .then(res => {
      return res.data.documents;
    })
    .catch(err => {
      throw new Error(err);
    });
};

function BookInfo({ bookName }: any) {
  const [cache, dispatch]: any = useBookCache();

  const BookName = bookName?.toLowerCase();
  const {
    data: Book,
    status,
    error,
    run,
    setData,
  } = useAsync({
    status: BookName ? 'pending' : 'idle',
  });

  React.useEffect(() => {
    if (!BookName) {
      return;
    } else if (cache[BookName]) {
      setData(cache[BookName]);
    } else {
      run(
        bookApi(bookName).then(BookData => {
          dispatch({ type: 'ADD_Book', BookName, BookData });
          setData(BookData); // Update the state directly instead of the cache
          return BookData;
        }),
      );
    }
  }, [cache, dispatch, BookName, run, setData]);

  if (status) {
    return (
      <BooksTableContainer
        autoFocus={true}
        disabled={false}
        isLoading={false}
        data={Book}
        status={status}
      />
    );
  }

  throw new Error('다시 시도해주세요');
}

const BookTalble = ({}) => {
  const [bookName, setBookName] = useState('');
  const { BookIsClose, SetBookIsClose } = React.useContext(ModalContext);
  const { book } = useSelector((state: RootState) => state.book);
  const dispatch = useDispatch();

  function handleSubmit(booksName: any) {
    setBookName(booksName);
  }

  const withoutBookInfo = () => {
    toast.error('책을 선택해주세요.', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,

      type: 'error',
    });
  };

  return (
    <>
      <div className="grid h-[calc(100vh-8rem)] w-full grid-rows-12 px-[2rem] mmd:h-[100vh] mmd:px-[1rem] mxs:px-[0.5rem]">
        <div className="row-span-1 flex w-full items-end pb-4 mxs:px-[0rem]">
          <BooksTableForm
            BookName={bookName}
            onSubmit={handleSubmit}
            BookIsClose={BookIsClose}
            SetBookIsClose={SetBookIsClose}
          />
        </div>
        <div className="row-span-10 overflow-y-scroll rounded-md border border-[#EDEFF5] scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-900 scrollbar-thumb-rounded-3xl scrollbar-w-2 dark:border-none">
          <BookInfo bookName={bookName} />
        </div>

        <div className="flex items-center justify-between pt-4 dark:text-[#e4e5e7] mmd:hidden">
          <div className="ml-2 flex">
            {book?.thumbnail ? (
              <img src={book?.thumbnail} width="45px" height="70px" />
            ) : (
              ''
            )}

            <div className="ml-2">{book?.title ? book?.title : ''}</div>
            {book?.title ? (
              <MdClose
                onClick={() => dispatch(getBookInfoSuccess(''))}
                tabIndex={1}
                size={20}
                color="#f31260"
                className="ml-1 rounded-full transition-all hover:bg-[#cfd2e2] hover:p-1"
              />
            ) : (
              ''
            )}
          </div>
          <div className="flex">
            <div
              onClick={() => {
                dispatch(getPostTitle(''));
                dispatch(getPostBody(''));
                dispatch(getPostTags([]));
                dispatch(getPostId(''));
                dispatch(getThumbnail(''));
                SetBookIsClose(!BookIsClose);
              }}>
              <ArrowLink
                href={'/write'}
                direction="right"
                className="mr-8"
                textSize="small">
                Skip
              </ArrowLink>
            </div>

            <div
              onClick={() => {
                dispatch(getPostTitle(''));
                dispatch(getPostBody(''));
                dispatch(getPostTags([]));
                dispatch(getPostId(''));
                dispatch(getThumbnail(''));
                book?.title ? SetBookIsClose(!BookIsClose) : '';
                book?.title ? '' : withoutBookInfo();
              }}>
              <ArrowLink
                href={book?.title ? '/write' : ''}
                direction="right"
                className=""
                textSize="small">
                다음
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>

      <div className="fxied bottom-0 w-full bg-[#e9e9e9] py-2 md:hidden mmd:fixed mmd:bottom-0 mmd:px-[2rem] mxs:px-[0.5rem]">
        <div className="flex justify-between">
          <div className="flex">
            {book?.thumbnail ? (
              <img
                src={book?.thumbnail}
                width="45px"
                height="60px"
                className="mxs:hidden"
              />
            ) : (
              ''
            )}
            <div className="ml-2 w-full max-w-[100px] truncate text-sm">
              {book?.title ? book?.title : ''}
            </div>
            {book?.title ? (
              <MdClose
                onClick={() => dispatch(getBookInfoSuccess(''))}
                tabIndex={1}
                size={20}
                color="#f31260"
                className="ml-1 rounded-full transition-all hover:bg-[#cfd2e2] hover:p-1"
              />
            ) : (
              ''
            )}
          </div>

          <div className="flex items-center">
            <NextLink
              className="mr-2"
              click={() => {
                dispatch(getPostTitle(''));
                dispatch(getPostBody(''));
                dispatch(getPostTags([]));
                dispatch(getPostId(''));
                dispatch(getThumbnail(''));
                SetBookIsClose(!BookIsClose);
              }}
              href="/write">
              <div className="mr-2 flex items-center justify-between text-base font-semibold text-[#334155]">
                Skip
              </div>
            </NextLink>

            <NextLink
              click={() => {
                dispatch(getPostTitle(''));
                dispatch(getPostBody(''));
                dispatch(getPostTags([]));
                dispatch(getPostId(''));
                dispatch(getThumbnail(''));
                book?.title ? SetBookIsClose(!BookIsClose) : '';
                book?.title ? '' : withoutBookInfo();
              }}
              href={book?.title ? '/write' : ''}>
              <div className="mr-2 flex items-center justify-between pl-6 text-base font-semibold text-[#334155] mxs:pl-2">
                다음
              </div>
            </NextLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookTalble;
