import React from "react";
import Layout from "../../components/Organisms/Layout";
import { getAllBlogIds, getBlogData } from "../../lib/blogs";
import cheerio from "cheerio";
import hljs from "highlight.js";
import "highlight.js/styles/hybrid.css";
import Moment from "react-moment";
import Profile from "../../components/Molecules/Profile";
import { BlogType } from "../../components/Molecules/Blog";
import { GetStaticPaths, GetStaticProps } from "next";

type BlogPageProps = {
  blog: BlogType;
};

const Blog: React.FC<BlogPageProps> = ({ blog }) => {
  return (
    <Layout title={blog.title}>
      <div className="my-5 flex flex-col sm:flex-row justify-center mx-5 min-h-[calc(100vh_-_100px)]">
        <div className="p-3 my-3 bg-gray-50 w-full sm:w-3/5 mr-5 markdown">
          <div className="flex justify-center text-3xl mx-auto py-2 font-bold">
            {blog.title}
          </div>
          <p className="mb-3 flex justify-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mt-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Moment format="YYYY/MM/DD">{blog.publishedAt}</Moment>
          </p>
          <div
            className="markdown"
            dangerouslySetInnerHTML={{ __html: `${blog.body}` }}
          ></div>
        </div>
        <div className="w-full sm:w-72 mt-3 sm:ml-6">
          <Profile />
        </div>
      </div>
    </Layout>
  );
};

export default Blog;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllBlogIds();

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const blog = await getBlogData(params.id);

  // ---- 追加する処理 ここから ----
  const $ = cheerio.load(blog.body); // blog.bodyはmicroCMSから返されるリッチエディタ部
  $("pre code").each((_, elm) => {
    const result = hljs.highlightAuto($(elm).text());
    $(elm).html(result.value);
    $(elm).addClass("hljs");
  });
  blog.body = $.html();

  return {
    props: {
      blog,
    },
    revalidate: 3,
  };
};
