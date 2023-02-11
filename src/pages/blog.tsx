import React, { useState } from 'react';
import { PageGrid, PostGrid } from '../components/layout/GridLayout';
import Navbar from '../components/navbar';
import { RiBookOpenLine } from 'react-icons/ri';
import { RiDashboard3Line } from 'react-icons/ri';
import { RiFileChartFill } from 'react-icons/ri';
import HomeTab from '../components/home/HomeTab';
import RatioImage from '../components/common/RatioImage';
import { PageLayout } from '../components/layout/PageLayout';
import Modal from '../components/common/Modal';
import SignUp from '../components/auth/Register';
import { NextSeo } from 'next-seo';
import { getNextSeo } from '../lib/nextSeo';
import AuthContainer from '../components/auth/AuthContainer';
import PostCard from '../components/post/PostCard';
import useGetPosts from '../components/post/hooks/useGetPosts';
import { AppLayout, First, MainNav, Second } from '../components/layout/AppLayout';
import { motion, useReducedMotion } from 'framer-motion';

export default function Home() {
  const { data, loading } = useGetPosts();

  return (
    <motion.div>
      <NextSeo {...getNextSeo({ title: 'Search page', description: '검색 페이지' })} />

      <PageLayout>
        <PageGrid as="div" className="pt-[2.25rem]">
          <MainNav className="col-span-2 mmd:hidden">
            <Navbar
              primaryItems={[
                {
                  icon: <RiBookOpenLine />,
                  text: '포스트',
                  to: '/',
                },
                {
                  icon: <RiDashboard3Line />,
                  text: '게시판',
                  to: '/post',
                },
              ]}
              secondaryItems={[
                {
                  icon: <RiFileChartFill />,
                  text: 'Trending tags',
                  to: '/Trending tags',
                },
              ]}></Navbar>
          </MainNav>

          <AppLayout
            className="col-span-8 mmd:col-span-12"
            first={
              <First>
                <div className="flex justify-between items-center">
                  <div className="text-lg text-[#18191b] font-semibold pb-[0.5rem] dark:text-[#e4e5e7]">
                    포스트
                  </div>
                  <HomeTab />
                </div>
              </First>
            }
            second={
              <Second>
                <PostGrid className="mt-[1rem]">
                  <PostCard
                    posts={data?.recentPosts.slice(0, 3) || []}
                    loading={!data || loading}
                  />
                </PostGrid>
              </Second>
            }
          />
        </PageGrid>
      </PageLayout>
      <style global jsx>{``}</style>
    </motion.div>
  );
}
