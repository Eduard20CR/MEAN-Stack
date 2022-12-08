import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PostModel } from '../models/posrtModel';

const BACKEND_URL = environment.apiURL + '/posts';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postList: PostModel[] = [];
  postCount!: number;
  subjectPost = new Subject<{ post: PostModel[]; postCount: number }>();
  subjectErrorHandler = new Subject<void>();

  constructor(private http: HttpClient, private router: Router) {}

  getPostList(pagesize: number, currentPage: number) {
    const queryParams = `?pagesize=${pagesize}&page=${currentPage}`;

    this.http
      .get<{ message: string; posts: any[]; maxPost: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData): { maxPost: number; posts: PostModel[] } => {
          console.log(postData);
          return {
            maxPost: postData.maxPost,
            posts: postData.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
          };
        })
      )
      .subscribe((tranformedPostsData) => {
        this.postList = tranformedPostsData.posts;
        this.postCount = tranformedPostsData.maxPost;
        this.nextPostSubject();
      });
  }

  getPostSubject() {
    return this.subjectPost.asObservable();
  }

  getPostById(id: string) {
    return this.http.get<{ message: string; post: any }>(
      BACKEND_URL + '/' + id
    );
    // return { ...this.postList.find((post) => post.id === id) } as PostModel;
  }

  addPost(postObj: any) {
    const postData = new FormData();
    postData.append('title', postObj.title);
    postData.append('content', postObj.content);
    postData.append('image', postObj.image);
    this.http
      .post<{ message: string; post: PostModel }>(BACKEND_URL, postData)
      .subscribe(
        (res) => {
          this.router.navigate(['/']);
        },
        () => {
          this.subjectErrorHandler.next();
        }
      );
  }

  deletePost(idPost: string) {
    return this.http.delete<{ message: string }>(BACKEND_URL + '/' + idPost);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postEdited: PostModel | FormData;
    if (typeof image === 'object') {
      postEdited = new FormData();
      postEdited.append('title', title);
      postEdited.append('content', content);
      postEdited.append('image', image, title);
    } else {
      postEdited = {
        id,
        title,
        content,
        imagePath: image,
      };
    }
    this.http
      .put<{ message: string }>(BACKEND_URL + '/' + id, postEdited)
      .subscribe(
        (res) => {
          this.router.navigate(['/']);
        },
        () => {
          this.subjectErrorHandler.next();
        }
      );
  }

  nextPostSubject() {
    this.subjectPost.next({
      post: [...this.postList],
      postCount: this.postCount,
    });
  }
}
