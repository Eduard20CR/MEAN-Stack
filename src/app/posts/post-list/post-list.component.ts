import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { PostModel } from 'src/app/shared/models/posrtModel';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PostService } from 'src/app/shared/services/post.service';

@Component({
  selector: '[app-post-list]',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
})
export class PostListComponent implements OnInit, OnDestroy {
  postList: PostModel[] = [];
  postSubject!: Subscription;
  isLoading = false;
  totalPost = 10;
  postPerPage = 2;
  currentPage = 1;

  userId!: string;
  isLoggedIn = false;
  authStatusSubscription!: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postSubject = this.postService
      .getPostSubject()
      .subscribe((postData: { post: PostModel[]; postCount: number }) => {
        this.postList = postData.post;
        this.totalPost = postData.postCount;
        this.isLoading = false;
      });
    this.postService.getPostList(this.postPerPage, this.currentPage);

    this.isLoggedIn = this.authService.getIsAuth();
    this.authStatusSubscription = this.authService
      .getAuthListener()
      .subscribe((status) => {
        this.isLoggedIn = status;
        this.userId = this.authService.getUserId();
      });

    this.userId = this.authService.getUserId();
  }

  onDeletePost(idPost: string) {
    this.postService.deletePost(idPost).subscribe(
      () => {
        this.postService.getPostList(this.postPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postService.getPostList(this.postPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postSubject.unsubscribe();
    this.authStatusSubscription.unsubscribe();
  }
}
