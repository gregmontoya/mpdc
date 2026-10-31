import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blog = await getCollection('blog');
    return rss({
        title: "Men's Post-Divorce Coaching",
        description: "Rebuild your life after divorce with proven strategies and mindset frameworks.",
        site: context.site,
        items: blog.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.description,
            link: `/learn/${post.slug}`,
        })),
        customData: `<language>en-us</language>`,
    });
}
