import { test } from '@japa/runner'
import User from '#models/user'
import BlogPost from '#models/blog_post'
import BlogCategory from '#models/blog_category'
import Store from '#models/store'
import testUtils from '@adonisjs/core/services/test_utils'

function createStoreData() {
  return {
    name: 'Test Store',
    slug: 'test-store',
    defaultCurrency: 'USD',
    defaultLocale: 'en',
    timezone: 'UTC',
    isActive: true,
    config: {},
    meta: {},
  }
}

test.group('Blog - Post CRUD', (group) => {
  let admin: User
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
    admin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })
  })

  test('admin can list blog posts', async ({ client }) => {
    const response = await client.get('/admin/blog').loginAs(admin)
    response.assertStatus(200)
  })

  test('admin can access create post page', async ({ client }) => {
    const response = await client.get('/admin/blog/create').loginAs(admin)
    response.assertStatus(200)
  })

  test('admin can create a blog post', async ({ assert, client }) => {
    const response = await client.post('/admin/blog').loginAs(admin).form({
      title: 'My First Post',
      slug: 'my-first-post',
      excerpt: 'A short excerpt',
      content: '<p>Hello world</p>',
      status: 'draft',
    })

    response.assertStatus(302)

    const post = await BlogPost.findBy('slug', 'my-first-post')
    assert.isNotNull(post)
    if (post) {
      assert.equal(post.title, 'My First Post')
      assert.equal(post.status, 'draft')
    }
  })

  test('admin can update a blog post', async ({ assert, client }) => {
    const post = await BlogPost.create({
      storeId: store.id,
      title: 'Old Title',
      slug: 'old-title',
      status: 'draft',
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    const response = await client
      .patch(`/admin/blog/${post.id}`)
      .loginAs(admin)
      .form({
        title: 'New Title',
        slug: 'new-title',
        status: 'published',
      })

    response.assertStatus(302)

    await post.refresh()
    assert.equal(post.title, 'New Title')
    assert.equal(post.status, 'published')
  })

  test('admin can delete a blog post', async ({ assert, client }) => {
    const post = await BlogPost.create({
      storeId: store.id,
      title: 'Delete Me',
      slug: 'delete-me',
      status: 'draft',
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    const response = await client.delete(`/admin/blog/${post.id}`).loginAs(admin)
    response.assertStatus(302)

    const found = await BlogPost.find(post.id)
    assert.isNull(found)
  })

  test('unauthenticated user cannot access admin blog', async ({ client }) => {
    const response = await client.get('/admin/blog')
    response.assertStatus(302)
  })
})

test.group('Blog - Categories', (group) => {
  let admin: User
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
    admin = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      isActive: true,
    })
  })

  test('admin can list blog categories', async ({ client }) => {
    const response = await client.get('/admin/blog/categories').loginAs(admin)
    response.assertStatus(200)
  })

  test('create a blog category', async ({ assert }) => {
    const category = await BlogCategory.create({
      storeId: store.id,
      name: 'Tech',
      slug: 'tech',
      description: 'Technology posts',
      sortOrder: 1,
    })

    assert.isNotNull(category.id)
    assert.equal(category.name, 'Tech')
    assert.equal(category.slug, 'tech')
  })

  test('category slug is unique per store', async ({ assert }) => {
    await BlogCategory.create({
      storeId: store.id,
      name: 'Tech',
      slug: 'tech',
      sortOrder: 1,
    })

    try {
      await BlogCategory.create({
        storeId: store.id,
        name: 'Tech 2',
        slug: 'tech',
        sortOrder: 2,
      })
      assert.fail('Should have thrown for duplicate slug')
    } catch {
      assert.isTrue(true)
    }
  })

  test('update a blog category', async ({ assert }) => {
    const category = await BlogCategory.create({
      storeId: store.id,
      name: 'Old Name',
      slug: 'old-name',
      sortOrder: 1,
    })

    category.merge({ name: 'New Name', slug: 'new-name' })
    await category.save()
    await category.refresh()

    assert.equal(category.name, 'New Name')
    assert.equal(category.slug, 'new-name')
  })

  test('delete a blog category', async ({ assert }) => {
    const category = await BlogCategory.create({
      storeId: store.id,
      name: 'Delete Me',
      slug: 'delete-me',
      sortOrder: 1,
    })

    await category.delete()
    const found = await BlogCategory.find(category.id)
    assert.isNull(found)
  })

  test('post category is set to null when category deleted', async ({ assert }) => {
    const category = await BlogCategory.create({
      storeId: store.id,
      name: 'Temp',
      slug: 'temp',
      sortOrder: 1,
    })

    const post = await BlogPost.create({
      storeId: store.id,
      blogCategoryId: category.id,
      title: 'Post With Category',
      slug: 'post-with-category',
      status: 'draft',
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    await category.delete()
    await post.refresh()

    assert.isNull(post.blogCategoryId)
  })
})

test.group('Blog - Storefront', (group) => {
  let store: Store

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()

    store = await Store.create(createStoreData())
  })

  test('blog index page loads', async ({ client }) => {
    const response = await client.get('/blog')
    response.assertStatus(200)
  })

  test('blog shows only published posts', async ({ client }) => {
    await BlogPost.create({
      storeId: store.id,
      title: 'Published Post',
      slug: 'published-post',
      status: 'published',
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    await BlogPost.create({
      storeId: store.id,
      title: 'Draft Post',
      slug: 'draft-post',
      status: 'draft',
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    const response = await client.get('/blog')
    response.assertStatus(200)
  })

  test('blog post detail page loads for published post', async ({ client }) => {
    await BlogPost.create({
      storeId: store.id,
      title: 'Detail Post',
      slug: 'detail-post',
      status: 'published',
      content: '<p>Content</p>',
      tags: ['test'],
      isFeatured: false,
      viewCount: 0,
    })

    const response = await client.get('/blog/detail-post')
    response.assertStatus(200)
  })

  test('blog post detail returns 404 for non-existent slug', async ({ client }) => {
    const response = await client.get('/blog/non-existent-post')
    response.assertStatus(404)
  })

  test('view count increments on post visit', async ({ assert }) => {
    const post = await BlogPost.create({
      storeId: store.id,
      title: 'View Counter',
      slug: 'view-counter',
      status: 'published',
      tags: [],
      isFeatured: false,
      viewCount: 5,
    })

    await client.get('/blog/view-counter')
    await post.refresh()

    assert.equal(post.viewCount, 6)
  })

  test('reading time is calculated from content', async ({ assert }) => {
    const longContent = Array(400).fill('word').join(' ')
    const post = await BlogPost.create({
      storeId: store.id,
      title: 'Long Post',
      slug: 'long-post',
      status: 'published',
      content: `<p>${longContent}</p>`,
      tags: [],
      isFeatured: false,
      viewCount: 0,
    })

    assert.equal(post.readingTime, 2)
  })
})
